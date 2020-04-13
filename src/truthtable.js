const parsers = require("./parsers.js");
const logic = require("./logic.js");

function onConstructionButton() {
  const textInput = document.getElementById("formulaTextInput");
  const resultDiv = document.getElementById("result");
  const formulaText = textInput.value;
  const result = parsers.parsePlFormula(formulaText);

  /* clearing results: */
  for(const element of resultDiv.childNodes) {
    element.remove();
  };

  if(result.type === parsers.ParseResult.SUCCESS) {
    const span = document.createElement("span");
    const innerText = document.createTextNode(logic.stringifyFormula(result.formula));
    resultDiv.classList.add("success");
    resultDiv.appendChild(innerText);
  } else if(result.type === parsers.ParseResult.FAILURE) {
    const span = document.createElement("span");
    const innerText = document.createTextNode(result.message);
    resultDiv.classList.add("failure");
    resultDiv.appendChild(innerText);
    console.warn(result);
  } else {
    /* */
  }
};


/* Global functions: */
window.onConstructionButton = onConstructionButton;
