const parsers = require("./parsers.js");
const logic = require("./logic.js");

function createSyntaxtree(formula) {
  const node = document.createElement("li");
  const contentSpan = document.createElement("span");
  contentSpan.classList.add("tf-nc");

  const children = document.createElement("ul");
  if(logic.FormulaType.binary.includes(formula.type)) {
    const leftTree = createSyntaxtree(formula.left);
    const rightTree = createSyntaxtree(formula.right);
    children.appendChild(leftTree);
    children.appendChild(rightTree);
    contentSpan.appendChild(
      document.createTextNode(
        logic.FormulaType.getFormulaConnective(formula.type)));
  } else if(formula.type === logic.FormulaType.NEGATION) {
    const innerTree = createSyntaxtree(formula.innerFormula);
    children.appendChild(innerTree);
    contentSpan.appendChild(
      document.createTextNode(
        logic.FormulaType.getFormulaConnective(formula.type)));
  } else if(formula.type === logic.FormulaType.ATOM) {
    contentSpan.appendChild(
      document.createTextNode(
        formula.name));
  }
  node.appendChild(contentSpan);
  if(formula.type !== logic.FormulaType.ATOM) {
    node.appendChild(children);
  }
  return node;
}

function onConstructionButton() {
  const textInput = document.getElementById("formulaTextInput");
  const resultDiv = document.getElementById("result");
  const formulaText = textInput.value;
  const result = parsers.parsePlFormula(formulaText);

  /* clearing results: */
  resultDiv.classList.remove("success");
  resultDiv.classList.remove("failure");
  for(const element of resultDiv.childNodes) {
    element.remove();
  };
  if(result.type === parsers.ParseResult.SUCCESS) {
    resultDiv.classList.add("success");
    const resultingTree = document.createElement("ul");
    const syntaxTree = createSyntaxtree(result.formula);
    resultingTree.appendChild(syntaxTree);
    resultDiv.appendChild(resultingTree);
  } else if(result.type === parsers.ParseResult.FAILURE) {
    const span = document.createElement("span");
    const innerText = `${result.message} Check ${result.location.start.column}-th character.`
    resultDiv.classList.add("failure");
    resultDiv.appendChild(document.createTextNode(innerText));
    console.warn(result);
  } else {
    /* */
  }
};

/* register functions: */
document.getElementById("formulaButtonInput").addEventListener("click", onConstructionButton);
document.getElementById("formulaTextInput").addEventListener("keyup",
  function(event) { if(event.keyCode === 13) { onConstructionButton(); } } );
