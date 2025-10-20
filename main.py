import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow Chrome extension to access this API

# Logging setup
LOG_FILE = "logs/url_classification.log"
handler = RotatingFileHandler(LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5)
formatter = logging.Formatter("[%(asctime)s] %(levelname)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
handler.setFormatter(formatter)
app.logger.setLevel(logging.INFO)
app.logger.addHandler(handler)

# Load trained model & vectorizer
clf = joblib.load('models/malicious_url_model.pkl')
vectorizer = joblib.load('models/vectorizer.pkl')


@app.route('/')
def home():
    return jsonify("MalGuard is up and running."), 200


@app.route('/api/classify', methods=['POST'])
def classify_url():
    url = None
    if request.is_json:
        data = request.get_json(silent=True)
        url = data.get('url') if data else None
    if not url and 'url' in request.form:
        url = request.form['url']
    if not url and 'url' in request.args:
        url = request.args['url']
    if not url:
        raw = request.data.decode('utf-8').strip()
        if raw:
            url = raw
    if not url:
        app.logger.warning("Received request with no URL provided.")
        return jsonify({'error': 'No URL provided'}), 400

    X_vec = vectorizer.transform([url])
    pred_label = clf.predict(X_vec)[0]
    pred_proba = clf.predict_proba(X_vec)[0]
    confidence = float(np.max(pred_proba))

    # Convert np types to Python types before making the response
    pred_label = pred_label.item() if isinstance(pred_label, np.generic) else pred_label
    is_malicious = int(pred_label != 0) if isinstance(pred_label, (int, np.integer)) else str(pred_label) != "benign"

    app.logger.info(
        f"URL: {url} | Label: {pred_label} | Malicious: {is_malicious} | Confidence: {confidence:.4f}"
    )

    response = {
        "url": url,
        "is_malicious": bool(is_malicious),
        "label": str(pred_label),
        "confidence": round(float(confidence), 4)
    }

    return jsonify(response), 200



if __name__ == '__main__':
    print("MalGuard API running on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000)
