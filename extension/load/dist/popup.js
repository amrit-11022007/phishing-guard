const modeRadios = document.querySelectorAll('input[name="mode"]');
const manualSection = document.querySelector("#manualSection");
const autoSection = document.querySelector("#autoSection");
const inputText = document.querySelector("#inputText");
const analyzeButton = document.querySelector("#analyzeButton");
const autoAnalyzeButton = document.querySelector("#autoAnalyzeButton");
const textStatus = document.querySelector("#status");
const API_URL = "https://phishing-guard-87k1.onrender.com/analyze";
// Handle mode switching
modeRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
        const target = e.target;
        if (target.value === "auto") {
            if (manualSection)
                manualSection.style.display = "none";
            if (autoSection)
                autoSection.style.display = "block";
        }
        else {
            if (manualSection)
                manualSection.style.display = "block";
            if (autoSection)
                autoSection.style.display = "none";
        }
        if (textStatus)
            textStatus.textContent = "";
    });
});
// Function to analyze text and display results
async function analyzeText(text) {
    if (textStatus) {
        textStatus.textContent = "Analyzing...";
    }
    // Disable both buttons during analysis
    if (analyzeButton)
        analyzeButton.disabled = true;
    if (autoAnalyzeButton)
        autoAnalyzeButton.disabled = true;
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }
        const result = await res.json();
        const phishingMsg = result.phishing.isPhishing
            ? `⚠️ Phishing (${(result.phishing.confidence * 100).toFixed(1)}%)`
            : `✅ Not phishing (${(result.phishing.confidence * 100).toFixed(1)}%)`;
        const aiMsg = result.aiGenerated.isAI
            ? `🤖 AI-generated (${(result.aiGenerated.confidence * 100).toFixed(1)}%)`
            : `🧑 Human-written (${(result.aiGenerated.confidence * 100).toFixed(1)}%)`;
        if (textStatus) {
            textStatus.textContent = `${phishingMsg} | ${aiMsg}`;
        }
    }
    catch (err) {
        console.error(err);
        if (textStatus) {
            textStatus.textContent = "Error analyzing text. Try again.";
        }
    }
    finally {
        if (analyzeButton)
            analyzeButton.disabled = false;
        if (autoAnalyzeButton)
            autoAnalyzeButton.disabled = false;
    }
}
// Manual paste
analyzeButton?.addEventListener("click", async () => {
    const text = inputText?.value.trim();
    if (!text) {
        if (textStatus) {
            textStatus.textContent = "Please paste some text first.";
        }
        return;
    }
    await analyzeText(text);
});
// Auto detect
autoAnalyzeButton?.addEventListener("click", async () => {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (!tab?.id) {
            if (textStatus)
                textStatus.textContent =
                    "Cannot access current tab. Paste the content manually";
            return;
        }
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                function extractEmailData(container) {
                    const sender = container.querySelector("span[email]");
                    const senderEmail = sender?.getAttribute("email") ?? null;
                    const senderName = sender?.getAttribute("name") ?? null;
                    const subject = container.querySelector("h2[data-thread-perm-id]")
                        ?.innerText ?? null;
                    const bodyEl = container.querySelector('div[role="listitem"] div.a3s');
                    const links = Array.from(bodyEl?.querySelectorAll("a[href]") ?? []).map((a) => a.href);
                    return {
                        senderEmail,
                        senderName,
                        subject,
                        body: bodyEl?.innerText ?? null,
                        links,
                    };
                }
                const emailContainer = document.querySelector('div[role="main"]');
                if (!emailContainer) {
                    return {
                        senderEmail: null,
                        senderName: null,
                        subject: null,
                        body: null,
                        links: [],
                        error: "No email found on this page.",
                    };
                }
                return extractEmailData(emailContainer);
            },
        });
        const emailData = results[0]?.result;
        if (!emailData || emailData.error) {
            if (textStatus)
                textStatus.textContent = emailData?.error || "No email data found.";
            return;
        }
        // Combine email data into text
        const textToAnalyze = `
From: ${emailData.senderName || "Unknown"} (${emailData.senderEmail || "Unknown"})
Subject: ${emailData.subject || "No Subject"}

${emailData.body || ""}

Links found: ${emailData.links?.join(", ") || "None"}
    `.trim();
        if (!textToAnalyze ||
            textToAnalyze ===
                `From: Unknown (Unknown)\nSubject: No Subject\n\n\nLinks found: None`) {
            if (textStatus)
                textStatus.textContent = "No content to analyze in this email.";
            return;
        }
        await analyzeText(textToAnalyze);
    }
    catch (err) {
        console.error(err);
        if (textStatus) {
            textStatus.textContent =
                "Error accessing email. Make sure you're on Gmail.";
        }
    }
});
export const PHISHING_GUARD_VERSION = "1.0.0";
//# sourceMappingURL=popup.js.map