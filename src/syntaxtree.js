const parser = require("./parser.js");
const logic = require("./logic.js");

const resultDiv = document.getElementById("result");
const inputDiv = document.getElementById("input");

logic.addFormulaInput(inputDiv, logic.booleanFormulaInstructions,
  (text) => {
    const formula = parser.parsePropositional(text);
    const tree = createSyntaxtree(formula);
    resultDiv.innerHTML = "";
    resultDiv.appendChild(tree);
  });

function createSyntaxtree(formula) {
  const node = document.createElement("li");
  const contentSpan = document.createElement("span");
  contentSpan.classList.add("tf-nc");

  const children = document.createElement("ul");
  if(formula instanceof logic.BiImplication
    || formula instanceof logic.Implication
    || formula instanceof logic.Disjunction
    || formula instanceof logic.Conjunction) {
    const leftTree = createSyntaxtree(formula.left);
    const rightTree = createSyntaxtree(formula.right);
    children.appendChild(leftTree);
    children.appendChild(rightTree);
    contentSpan.appendChild(document.createTextNode(formula.symbol));
  } else if(formula instanceof logic.Negation) {
    const innerTree = createSyntaxtree(formula.inner);
    children.appendChild(innerTree);
    contentSpan.appendChild(document.createTextNode("~"));
  } else if(formula instanceof logic.Proposition) {
    contentSpan.appendChild(document.createTextNode(formula.name));
  }
  node.appendChild(contentSpan);
  if(!(formula instanceof logic.Proposition)) {
    node.appendChild(children);
  }
  return node;
}
