const inputText = document.querySelector("#inputText");
const analyzeButton = document.querySelector("#analyzeButton");
const textStatus = document.querySelector("#status");
analyzeButton?.addEventListener("click", () => {
  const text = inputText?.value.trim();
  if (!text) {
    if (textStatus) {
      textStatus.textContent = "Please paste some text first.";
    }
    return;
  }
  console.log("Text to analyze \n", text);
  if (textStatus) {
    textStatus.textContent = "Text submitted for analysis.";
  }
});
console.log("Hello");
//# sourceMappingURL=popup.js.map
