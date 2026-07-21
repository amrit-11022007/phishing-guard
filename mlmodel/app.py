import streamlit as st
import pickle
import re

st.set_page_config(
    page_title="Phishing Email Detector",
    page_icon="🛡️",
    layout="centered"
)


def clean_email_text(text: str) -> str:
    text = text.lower()                                      
    text = re.sub(r'http\S+|www\S+|https\S+', ' url ', text) 
    text = re.sub(r'\S+@\S+', ' email ', text)             
    text = re.sub(r'\d+', ' number ', text)              
    text = re.sub(r'[^\w\s]', '', text)                   
    text = re.sub(r'\s+', ' ', text).strip()               
    return text

@st.cache_resource
def load_model():
    try:
        with open("phishingdetect.pkl", "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        st.error("⚠️ Model file 'phishingdetect.pkl' not found in repository root.")
        return None

model = load_model()

st.title("🛡️ Phishing Email Detector")
st.write("Analyze email content using a Stacking Ensemble Machine Learning Model.")

st.divider()

st.subheader("💡 Try Sample Emails")
col1, col2 = st.columns(2)
sample_text = ""

if col1.button("📩 Load Phishing Sample"):
    sample_text = "URGENT: Your bank account has been locked. Click http://verify-secure-bank.com immediately to restore access."

if col2.button("✉️ Load Legitimate Sample"):
    sample_text = "Hi team, please find attached the updated project schedule for tomorrow's review meeting."

user_input = st.text_area("Paste Email Text Here:", value=sample_text, height=160, placeholder="Enter text...")

if st.button("🔍 Analyze Text", type="primary", use_container_width=True):
    if not user_input.strip():
        st.warning("Please enter some text to analyze.")
    elif model:
        cleaned = clean_email_text(user_input)
        
        prediction = model.predict([cleaned])[0]
        probabilities = model.predict_proba([cleaned])[0]
        
        st.divider()
        st.subheader("📊 Result")
        
        if prediction == 1:
            st.error("🚨 **PHISHING THREAT DETECTED**")
            st.metric("Phishing Confidence", f"{probabilities[1] * 100:.2f}%")
            st.progress(float(probabilities[1]))
        else:
            st.success("✅ **SAFE LEGITIMATE EMAIL**")
            st.metric("Safety Confidence", f"{probabilities[0] * 100:.2f}%")
            st.progress(float(probabilities[0]))
