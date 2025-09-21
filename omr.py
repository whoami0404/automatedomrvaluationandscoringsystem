import cv2
import numpy as np
from PIL import Image
import io

# Utility: convert PIL Image to OpenCV BGR
def pil_to_cv2(img_pil: Image.Image):
    img = np.array(img_pil.convert('RGB'))
    return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

# Utility: convert OpenCV BGR to PIL Image
def cv2_to_pil(img_cv2):
    img_rgb = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2RGB)
    return Image.fromarray(img_rgb)

# Find largest 4-point contour (document boundary)
def find_document_contour(gray):
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    edged = cv2.Canny(blurred, 50, 200)
    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            return approx.reshape(4,2)
    return None

# Order points for perspective transform
def order_points(pts):
    rect = np.zeros((4,2), dtype='float32')
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

# Four point transform
def four_point_transform(image, pts):
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = max(int(widthA), int(widthB))
    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = max(int(heightA), int(heightB))
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype='float32')
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    return warped

# Simple grid-based bubble extractor and grader
CHOICES = ['A','B','C','D']

def grade_omr(pil_image: Image.Image, answer_key: dict, questions=100, rows=25, choices=4, threshold=0.4):
    """
    Process a PIL image of an OMR sheet and return grading results and debug images.
    answer_key: dict mapping '1'..'questions' -> 'A'..'D'
    Returns: dict with answers, subject_scores, total_score, and overlay image (PIL)
    """
    orig = pil_to_cv2(pil_image)
    gray = cv2.cvtColor(orig, cv2.COLOR_BGR2GRAY)
    doc_cnt = find_document_contour(gray)
    if doc_cnt is None:
        warped = orig.copy()
    else:
        warped = four_point_transform(orig, doc_cnt)
    warped_gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
    # normalize illumination and threshold
    warped_blur = cv2.GaussianBlur(warped_gray, (5,5), 0)
    th = cv2.adaptiveThreshold(warped_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY_INV, 25, 10)
    h, w = th.shape
    cell_h = h // rows
    cell_w = w // choices
    answers = {}
    overlay = warped.copy()
    for r in range(rows):
        q_no = r + 1
        answers[q_no] = {'selected': None, 'scores': []}
        y1 = r * cell_h
        y2 = y1 + cell_h
        for c in range(choices):
            x1 = c * cell_w
            x2 = x1 + cell_w
            cell = th[y1:y2, x1:x2]
            filled = cv2.countNonZero(cell)
            area = cell.shape[0] * cell.shape[1]
            frac = filled / float(area + 1e-9)
            answers[q_no]['scores'].append((CHOICES[c], float(frac)))
        scores_sorted = sorted(answers[q_no]['scores'], key=lambda x: x[1], reverse=True)
        best_choice, best_frac = scores_sorted[0]
        runner_up_frac = scores_sorted[1][1] if len(scores_sorted) > 1 else 0.0
        if best_frac > threshold and (best_frac - runner_up_frac) > 0.08:
            answers[q_no]['selected'] = best_choice
            c_idx = CHOICES.index(best_choice)
            cx = int((c_idx + 0.5) * cell_w)
            cy = int((r + 0.5) * cell_h)
            cv2.circle(overlay, (cx, cy), min(cell_w, cell_h)//6, (0,255,0), 2)
        else:
            answers[q_no]['selected'] = None
            cv2.rectangle(overlay, (0, y1), (w, y2), (0,0,255), 2)

    answers_out = {}
    for q in range(1, questions+1):
        sel = answers.get(q, {}).get('selected', None)
        answers_out[str(q)] = sel if sel is not None else ""

    # scoring per subject: 5 subjects, 20 questions each
    subject_scores = {}
    total = 0
    per_subject = 20
    for s in range(5):
        start = s*per_subject + 1
        end = (s+1)*per_subject
        correct = 0
        for q in range(start, end+1):
            key = answer_key.get(str(q), None)
            if key and answers_out.get(str(q), "") == key:
                correct += 1
        subject_scores[f'subject_{s+1}'] = int(correct)
        total += correct

    result = {
        'answers': answers_out,
        'subject_scores': subject_scores,
        'total_score': int(total),
    }
    overlay_pil = cv2_to_pil(overlay)
    result['overlay_image'] = overlay_pil
    return result

# Minimal demo answer key generator
def demo_answer_key(questions=100):
    import random
    random.seed(42)
    choices = ['A','B','C','D']
    return {str(i+1): random.choice(choices) for i in range(questions)}
