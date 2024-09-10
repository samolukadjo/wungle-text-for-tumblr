/* import { encode } from "../3y3/3y3.js"; */

const input = document.getElementById("wungleTextArea");
const button = document.getElementById("wungleButton");
const result = document.getElementById("wungleResult");

const development = true;

button.addEventListener("click", () => {
    const text = input.value;
    const encodedText = encode(text + "{wungle text ends here}");
    navigator.clipboard.writeText(encodedText);
    result.textContent = `The encoded text has been copied to your clipboard!`;
    if (development) {
        console.log("[Wungle Text]: Encoded text ", encodedText);
    }
})