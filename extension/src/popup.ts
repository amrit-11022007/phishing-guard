const inputText = document.querySelector<HTMLTextAreaElement>("#inputText");
const analyzeButton =
  document.querySelector<HTMLButtonElement>("#analyzeButton");
const textStatus = document.querySelector<HTMLParagraphElement>("#status");

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
