const input = document.getElementById("wungleTextArea");
const button = document.getElementById("wungleButton");
const result = document.getElementById("wungleResult");
const clearButton = document.getElementById("clearButton");

clearButton.addEventListener("click", () => {
  input.value = "";
  result.textContent = "";
  browser.storage.local.remove("textToBeWungled");
});

const development = true;

button.addEventListener("click", () => {
  const text = input.value;
  const encodedText = encode(text + "{wungle text ends here}");
  navigator.clipboard.writeText(encodedText);
  result.textContent = `The encoded text has been copied to your clipboard! Paste it at the start of a paragraph to hide wungle text in that paragraph. You can still write stuff in that paragraph, the invisible wungle characters just have to be at the begining of the block of content, this means that it can inserted into asks, headings, lists etc.`;
  if (development) {
    console.log("[Wungle Text]: Encoded text ", encodedText);
  }
});

input.addEventListener("input", () => {
  browser.storage.local.set({ textToBeWungled: input.value });
  console.log("Your text has been saved");
});

window.addEventListener("DOMContentLoaded", () => {
  browser.storage.local.get("textToBeWungled", (result) => {
    if (result.textToBeWungled) {
      input.value = result.textToBeWungled;
    }
  });
});
