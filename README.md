# Automated OMR Evaluation & Scoring System

## Theme 1 — Problem Statement
At Innomatics Research Labs, placement readiness assessments are conducted for roles such as Data Analytics and AI/ML for Data Science with Generative AI. Each exam uses standardized OMR sheets with 100 questions, divided as 20 questions per subject across 5 subjects. Evaluation is currently manual and suffers from long turnaround times, higher error rates, and high resource needs when processing thousands of sheets (≈3000) on an exam day.

## Objective
Design and implement a scalable, automated OMR evaluation system that:
- Accurately evaluates mobile-captured OMR sheets.
- Produces per-subject scores (0–20) and a total score (0–100).
- Supports multiple sheet versions (2–4 sets per exam).
- Provides a web interface for evaluators to manage uploads and results.
- Achieves an error tolerance of less than 0.5%.
- Reduces evaluation turnaround from days to minutes.

## Proposed Solution
The system will include the following components:
- Capture: Mobile phone camera images of OMR sheets.
- Preprocessing: Rotation, skew correction, illumination normalization, and perspective rectification.
- Bubble Detection & Evaluation: Classic CV (OpenCV) for grid detection and contour analysis; optional lightweight ML/TFLite classifier for ambiguous markings.
- Answer Key Matching: Map extracted responses to a per-version answer key.
- Result Generation & Storage: Compute subject-wise scores and total; store rectified images, overlay debug visuals, and JSON results for audit.
- Web Application: Streamlit (MVP) or Flask/FastAPI backend with a web UI for evaluators to upload, review flagged sheets, and export results.

## Workflow
1. Students fill printed OMR sheets during exams.
2. Sheets are digitized via mobile phone captures.
3. Evaluators upload captures through the web interface.
4. Pipeline steps execute automatically and produce per-student JSON results and exports (CSV/Excel).
5. Evaluators can review flagged/ambiguous sheets and reprocess if necessary.

## Evaluation & Metrics
- Target accuracy: >99.5% (error tolerance <0.5%).
- Processing time: aim for minutes per full batch (depends on infra).
- Auditability: store rectified images and overlay masks to validate scores.

## Tech Stack
Core OMR Evaluation:
- Python
- OpenCV
- NumPy / SciPy
- Pillow
- PyMuPDF (for PDFs)
- scikit-learn / TensorFlow Lite (optional)

Web Application (MVP):
- Streamlit for evaluator UI
- Flask / FastAPI for production APIs
- SQLite / PostgreSQL for metadata and results

## Files included
- streamlit_app.py — minimal Streamlit UI for uploads and demo grading (placeholder run_omr()).
- README.md — this file.
- requirements.txt — list of Python dependencies.

## Installation (Local)
1. Clone the repository:

```bash
git clone https://github.com/whoami0404/automatedomrvaluationandscoringsystem.git
cd automatedomrvaluationandscoringsystem
```

2. (Optional) Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the Streamlit demo app:

```bash
streamlit run streamlit_app.py
```

## Deployment (Streamlit Cloud)
1. Go to https://streamlit.io/cloud and sign in with GitHub.
2. Click "New app", select this repository and the main branch.
3. Set the main file to `streamlit_app.py` and deploy.
4. Add any secrets via the Streamlit Cloud dashboard (Settings → Secrets) if the app requires external storage keys.

## Usage
- Upload captured OMR images through the web UI to process and obtain JSON results.
- Export results as CSV for downstream reporting.

## Sample Data
Add a `sample_data/` directory to the repo and place example OMR captures and answer keys there. (If sample data is available, link or ZIP may be added.)

## Contributing
Contributions, bug reports, and feature requests are welcome. Please open issues and pull requests on GitHub.

## License & Contact
Specify your preferred license (e.g., MIT) and contact information.
