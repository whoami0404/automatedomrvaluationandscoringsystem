from flask import Flask, render_template, request, redirect, url_for, send_file, flash
import os
import io
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
from omr import grade_omr, demo_answer_key

UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'replace-this-with-a-secret'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        key_file = request.files.get('answer_key')
        if key_file:
            try:
                answer_key = json.load(key_file)
            except Exception:
                answer_key = demo_answer_key()
        else:
            answer_key = demo_answer_key()

        file = request.files.get('file')
        if not file or file.filename == '':
            flash('No file selected')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            in_memory = file.read()
            # Try to convert to PIL if pdf use PyMuPDF
            try:
                if filename.lower().endswith('.pdf'):
                    import fitz
                    doc = fitz.open(stream=in_memory, filetype='pdf')
                    page = doc.load_page(0)
                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes('png')
                    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                else:
                    img = Image.open(io.BytesIO(in_memory)).convert('RGB')
            except Exception as e:
                flash(f'Failed to read the uploaded file: {e}')
                return redirect(request.url)

            # Grade
            try:
                res = grade_omr(img, answer_key)
            except Exception as e:
                flash(f'Processing failed: {e}')
                return redirect(request.url)

            timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
            base = f"{os.path.splitext(filename)[0]}_{timestamp}"
            overlay_path = os.path.join(RESULTS_FOLDER, f"{base}_overlay.png")
            json_path = os.path.join(RESULTS_FOLDER, f"{base}_result.json")
            try:
                res['overlay_image'].save(overlay_path)
            except Exception:
                overlay_path = ''

            with open(json_path, 'w') as jf:
                json.dump({'file_name': filename, 'timestamp': timestamp, 'result': {'answers': res['answers'], 'subject_scores': res['subject_scores'], 'total_score': res['total_score']}}, jf, indent=2)

            return render_template('result.html', result=res, overlay=overlay_path, json_path=json_path)
        else:
            flash('Unsupported file type')
            return redirect(request.url)
    return render_template('index.html')

@app.route('/download/<path:filename>')
def download_file(filename):
    return send_file(filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
