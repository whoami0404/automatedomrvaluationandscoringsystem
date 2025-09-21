import streamlit as st
from PIL import Image
import io
import os
import json
import re
from datetime import datetime
import pandas as pd
import streamlit.components.v1 as components

from omr import grade_omr, demo_answer_key

st.set_page_config(page_title='Automated OMR Evaluator', layout='wide')

# Paths to HTML/CSS assets
TEMPLATE_PATH = os.path.join("templates", "index.html")
CSS_PATH = os.path.join("static", "style.css")

# Read and inline the HTML + CSS so the entire HTML/CSS experience is embedded inside Streamlit
landing_html = None
if os.path.exists(TEMPLATE_PATH):
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        landing_html = f.read()
    # If there's a separate CSS file, inline it into the HTML head to ensure the component renders correctly
    if os.path.exists(CSS_PATH):
        try:
            with open(CSS_PATH, "r", encoding="utf-8") as cf:
                css_text = cf.read()
            # Remove any existing <link rel="stylesheet" ...> references to the static CSS file
            landing_html = re.sub(r"<link[^>]*href=['\"]*.*style\.css['\"][^>]*>", "", landing_html, flags=re.IGNORECASE)
            # Inject the CSS into a <style> tag before </head>
            if "</head>" in landing_html:
                landing_html = landing_html.replace("</head>", f"<style>{css_text}</style></head>")
            else:
                landing_html = f"<style>{css_text}</style>\n" + landing_html
        except Exception:
            # If inlining fails, keep the raw HTML so the app still works
            pass

# Render the landing page component (Tailwind+custom CSS) if available
if landing_html:
    components.html(landing_html, height=380, scrolling=True)
else:
    st.warning("templates/index.html not found — the landing page is unavailable.")

st.title('Automated OMR Evaluation & Scoring System (MVP)')

RESULTS_DIR = 'results'
os.makedirs(RESULTS_DIR, exist_ok=True)

st.markdown("""
Upload OMR images (JPG/PNG) or single-page PDFs. The app will run the OMR pipeline, show overlay images, and allow downloading CSV/JSON results.
""")

st.sidebar.header('Answer Key')
uploaded_key = st.sidebar.file_uploader('Upload answer_key.json (optional)', type=['json'])
if uploaded_key:
    try:
        answer_key = json.load(uploaded_key)
        st.sidebar.success('Loaded uploaded answer key')
    except Exception as e:
        st.sidebar.error(f'Failed to load answer key: {e}')
        answer_key = demo_answer_key()
else:
    answer_key = demo_answer_key()
    st.sidebar.info('Using demo random answer key. Upload real answer_key.json for production.')

st.sidebar.header('Processing Options')
confidence_threshold = st.sidebar.slider('Fill confidence threshold', 0.05, 0.8, 0.4, 0.01)
process_button = st.sidebar.button('Process uploaded files')

uploaded_files = st.file_uploader('Upload OMR images (PNG/JPG/JPEG) or single-page PDFs', type=['png','jpg','jpeg','pdf'], accept_multiple_files=True)


def read_image_from_file(file_obj):
    filename = file_obj.name.lower()
    data = file_obj.read()
    if filename.endswith('.pdf'):
        try:
            import fitz
        except Exception as e:
            raise RuntimeError('PyMuPDF (fitz) is required to read PDFs: pip install PyMuPDF')
        doc = fitz.open(stream=data, filetype='pdf')
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=200)
        img_bytes = pix.tobytes('png')
        return Image.open(io.BytesIO(img_bytes)).convert('RGB')
    else:
        return Image.open(io.BytesIO(data)).convert('RGB')

if process_button:
    if not uploaded_files or len(uploaded_files) == 0:
        st.warning('Please upload one or more OMR images or a PDF first')
    else:
        results_list = []
        progress = st.progress(0)
        n = len(uploaded_files)
        for idx, up in enumerate(uploaded_files):
            st.write(f'Processing: {up.name} ({idx+1}/{n})')
            try:
                img = read_image_from_file(up)
            except Exception as e:
                st.error(f'Failed to read {up.name}: {e}')
                continue
            try:
                res = grade_omr(img, answer_key, threshold=confidence_threshold)
            except Exception as e:
                st.error(f'OMR processing failed for {up.name}: {e}')
                continue

            timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
            base_name = f"{os.path.splitext(up.name)[0]}_{timestamp}"
            overlay = res.get('overlay_image')
            overlay_path = os.path.join(RESULTS_DIR, f"{base_name}_overlay.png")
            try:
                overlay.save(overlay_path)
            except Exception:
                overlay_path = ""

            json_path = os.path.join(RESULTS_DIR, f"{base_name}_result.json")
            with open(json_path, 'w') as jf:
                json.dump({
                    'file_name': up.name,
                    'timestamp': timestamp,
                    'result': {
                        'answers': res.get('answers'),
                        'subject_scores': res.get('subject_scores'),
                        'total_score': res.get('total_score')
                    }
                }, jf, indent=2)

            row = {
                'file_name': up.name,
                'timestamp': timestamp,
                **res.get('subject_scores', {}),
                'total_score': res.get('total_score')
            }
            results_list.append({'meta': row, 'answers': res.get('answers'), 'overlay_path': overlay_path, 'json_path': json_path})
            if overlay is not None:
                st.image(overlay, caption=f"Overlay: {up.name}")
            progress.progress((idx+1)/n)

        if len(results_list) > 0:
            df_rows = [r['meta'] for r in results_list]
            df = pd.DataFrame(df_rows)
            csv_bytes = df.to_csv(index=False).encode('utf-8')
            st.download_button('Download results CSV', data=csv_bytes, file_name='omr_results.csv', mime='text/csv')

            combined = [{'meta': r['meta'], 'answers': r['answers']} for r in results_list]
            combined_bytes = json.dumps(combined, indent=2).encode('utf-8')
            st.download_button('Download combined JSON', data=combined_bytes, file_name='omr_results.json', mime='application/json')

            st.success('Processing complete. Audit files saved to the results/ directory on the server.')
            st.write('Saved audit files:')
            for r in results_list:
                st.write(r['overlay_path'])
                st.write(r['json_path'])
else:
    st.info('Upload files and click "Process uploaded files" in the sidebar to start.')

st.markdown('''---
Tip: Use the demo answer key for quick testing. For production, upload an answer_key.json mapping question numbers (1..100) to choices 'A'..'D'.''')
