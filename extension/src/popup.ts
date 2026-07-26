const inputText = document.querySelector<HTMLTextAreaElement>("#inputText");
const analyzeButton =
  document.querySelector<HTMLButtonElement>("#analyzeButton");
const textStatus = document.querySelector<HTMLParagraphElement>("#status");

const API_URL = "https://phishing-guard-87k1.onrender.com/analyze";

interface AnalyzeResponse {
  phishing: { isPhishing: boolean; confidence: number };
  aiGenerated: { isAI: boolean; confidence: number };
}

analyzeButton?.addEventListener("click", async () => {
  const text = inputText?.value.trim();

  if (!text) {
    if (textStatus) {
      textStatus.textContent = "Please paste some text first.";
    }
    return;
  }

  if (textStatus) {
    textStatus.textContent = "Analyzing...";
  }
  if (analyzeButton) {
    analyzeButton.disabled = true;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const result: AnalyzeResponse = await res.json();

    const phishingMsg = result.phishing.isPhishing
      ? `⚠️ Phishing (${(result.phishing.confidence * 100).toFixed(1)}%)`
      : `✅ Not phishing (${(result.phishing.confidence * 100).toFixed(1)}%)`;

    const aiMsg = result.aiGenerated.isAI
      ? `🤖 AI-generated (${(result.aiGenerated.confidence * 100).toFixed(1)}%)`
      : `🧑 Human-written (${(result.aiGenerated.confidence * 100).toFixed(1)}%)`;

    if (textStatus) {
      textStatus.textContent = `${phishingMsg} | ${aiMsg}`;
    }
  } catch (err) {
    console.error(err);
    if (textStatus) {
      textStatus.textContent = "Error analyzing text. Try again.";
    }
  } finally {
    if (analyzeButton) {
      analyzeButton.disabled = false;
    }
  }
});
