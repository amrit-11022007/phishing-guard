import re
import pickle
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "mlmodel"  

app = Flask(__name__)
CORS(app)  

with open(MODEL_DIR / "phishingdetect.pkl", "rb") as f:
    phishing_model = pickle.load(f)

with open(MODEL_DIR / "aidetector.pkl", "rb") as f:
    ai_model = pickle.load(f)


def clean_email_text(text: str) -> str:
  
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", " url ", text)
    text = re.sub(r"\S+@\S+", " email ", text)
    text = re.sub(r"\d+", " number ", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify(error="No text provided"), 400
    if len(text) > 20000:
        return jsonify(error="Text too long"), 400

    cleaned = clean_email_text(text)
    phishing_pred = int(phishing_model.predict([cleaned])[0])
    phishing_conf = float(phishing_model.predict_proba([cleaned])[0][1])

    
    ai_pred = int(ai_model.predict([text])[0])
    ai_conf = float(ai_model.predict_proba([text])[0][1])

    return jsonify(
        phishing={"isPhishing": bool(phishing_pred), "confidence": round(phishing_conf, 4)},
        aiGenerated={"isAI": bool(ai_pred), "confidence": round(ai_conf, 4)},
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
