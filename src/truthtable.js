const parsers = require("./parsers.js");
const logic = require("./logic.js");

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
    const resultingTable = document.createElement("table");
    const firstRow = document.createElement("tr");
    resultingTable.appendChild(firstRow);

    const atoms = logic.getAtoms(result.formula);
    var uniqueVariables = [];
    for(const atom of atoms) {
      const variable = atom.atom;
      if(uniqueVariables.every(function(foundVariable) { return foundVariable.name !== variable.name })) {
        uniqueVariables.push(variable);
      }
    }

    const truthtableRow = flattenFormula(result.formula);

    for(const variable of uniqueVariables) {
      const currentAtomHeader = document.createElement("th");
      firstRow.appendChild(currentAtomHeader);
      currentAtomHeader.appendChild(document.createTextNode(variable.name));
    }
    for(const subFormula of truthtableRow) {
      const currentSubFormulaHeader = document.createElement("th");
      firstRow.appendChild(currentSubFormulaHeader);
      if(typeof(subFormula) === "string") {
        currentSubFormulaHeader.appendChild(document.createTextNode(subFormula));
      } else if(subFormula.type !== logic.FormulaType.ATOM) {
        currentSubFormulaHeader.appendChild(document.createTextNode(logic.FormulaType.getFormulaConnective(subFormula.type)));
      } else if(subFormula.type === logic.FormulaType.ATOM) {
        currentSubFormulaHeader.appendChild(document.createTextNode(subFormula.atom.name));
      }
    }


    resultDiv.appendChild(resultingTable);
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

function flattenFormula(formula) {
  var result = [];

  if(formula.type === logic.FormulaType.ATOM) {
    result = [formula];
  } else if(logic.FormulaType.binary.includes(formula.type)) {
    var flatLeft = flattenFormula(formula.left);
    var flatRight = flattenFormula(formula.right);
    if(logic.FormulaType.binary.includes(formula.left.type) && formula.left.type < formula.type) {
      flatLeft = ["("].concat(flatLeft).concat([")"]);
    }
    if(logic.FormulaType.binary.includes(formula.right.type) && formula.right.type < formula.type) {
      flatRight = ["("].concat(flatRight).concat([")"]);
    }
    return flatLeft.concat([formula]).concat(flatRight);
  } else if(logic.FormulaType.unary.includes(formula.type)
            || logic.FormulaType.quantification.includes(formula.type)) {
    var flatInner = flattenFormula(formula.innerFormula);
    if(logic.FormulaType.binary.includes(formula.innerFormula.type)) {
      flatInner = ["("].concat(flatInner).concat([")"]);
    }
    return flatInner;
  }

  return result;
}


/* Global functions: */
window.onConstructionButton = onConstructionButton;
