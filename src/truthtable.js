const parsers = require("./parsers.js");
const logic = require("./logic.js");

const RowType = {
  OPENBRACKET: 0,
  CLOSEBRACKET: 1,
  SUBFORMULA: 2
}

function getUniqueAtoms(formula) {
  const atoms = logic.getAtoms(formula);
  var uniqueAtoms = [];
  for(const atom of atoms) {
    if(uniqueAtoms.every(function(presentAtom) { return presentAtom.name !== atom.name; })) {
      uniqueAtoms.push(atom);
    }
  }
  uniqueAtoms.sort();
  return uniqueAtoms;
}

function createFirstRow(atoms, row) {
  const firstRow = document.createElement("tr");
  firstRow.setAttribute("id", "firstRow");
  var lastAtomHeader = null;
  for(const variable of atoms) {
    const currentAtomHeader = document.createElement("th");
    currentAtomHeader.classList.add("atomHeader");
    firstRow.appendChild(currentAtomHeader);
    currentAtomHeader.appendChild(document.createTextNode(variable.name));
    lastAtomHeader = currentAtomHeader;
  }
  lastAtomHeader.classList.add("lastAtomCell");
  for(const subFormula of row) {
    const currentSubFormulaHeader = document.createElement("th");
    firstRow.appendChild(currentSubFormulaHeader);
    if(subFormula.type === RowType.OPENBRACKET) {
      currentSubFormulaHeader.appendChild(document.createTextNode("("));
    } else if(subFormula.type === RowType.CLOSEBRACKET) {
      currentSubFormulaHeader.appendChild(document.createTextNode(")"));
    } else if(subFormula.type === RowType.SUBFORMULA) {
      var textNode;
      if(subFormula.subFormula.type === logic.FormulaType.ATOM) {
        textNode = document.createTextNode(subFormula.subFormula.name);
      } else {
        textNode = document.createTextNode(
          logic.FormulaType.getFormulaConnective(
            subFormula.subFormula.type));
      }
      currentSubFormulaHeader.appendChild(textNode);
    }
  }
  return firstRow;
}

function createEvaluatedRow(atoms, row, interpretation) {
  const newRow = document.createElement("tr");
  var lastAtomCell = null;
  for(const atom of atoms) {
    const cell = document.createElement("td");
    cell.classList.add("atomCell");
    newRow.appendChild(cell);
    if(logic.evaluate(atom, interpretation)) {
      cell.appendChild(document.createTextNode("1"));
    } else {
      cell.appendChild(document.createTextNode("0"));
    }
    lastAtomCell = cell;
  }
  lastAtomCell.classList.add("lastAtomCell");
  for(const rowElement of row) {
    const cell = document.createElement("td");
    newRow.appendChild(cell);
    if(rowElement.type === RowType.OPENBRACKET
      || rowElement.type === RowType.CLOSEBRACKET
      || (rowElement.type === RowType.SUBFORMULA
          && rowElement.subFormula.type === logic.FormulaType.ATOM)) {
      continue;
    } else {
      if(logic.evaluate(rowElement.subFormula, interpretation)) {
        cell.appendChild(document.createTextNode("1"));
      } else {
        cell.appendChild(document.createTextNode("0"));
      }
    }
  }
  return newRow;
}

function enumerateInterpretations(atoms) {
  var head;
  var rest;
  if(atoms.length === 0) {
    return [];
  } else if(atoms.length === 1) {
    [head] = atoms;
    result = [new logic.plInterpretation([]),
              new logic.plInterpretation([head.name])];
    return result;
  } else {
    [head, ...rest] = atoms;
    const restInterpretations = enumerateInterpretations(rest);
    var newInterpretations = [];
    for(const oldInterpretation of restInterpretations) {
      const updatedInterpretation = new logic.plInterpretation(
        [...oldInterpretation.trueVariables].concat([head.name]));
      newInterpretations.push(updatedInterpretation);
    }
    return restInterpretations.concat(newInterpretations)
  }
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
    const resultingTable = document.createElement("table");
    resultingTable.classList.add("truthtable");

    const uniqueAtoms = getUniqueAtoms(result.formula);
    const truthtableRow = constructRow(result.formula);
    const headerRow = createFirstRow(uniqueAtoms, truthtableRow);
    resultingTable.appendChild(headerRow);
    for(interpretation of enumerateInterpretations(uniqueAtoms)) {
      const evaluatedRow = createEvaluatedRow(uniqueAtoms, truthtableRow,
        interpretation);
      resultingTable.appendChild(evaluatedRow);
    }
    resultDiv.appendChild(resultingTable);
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

function constructRow(formula) {
  if(formula.type === logic.FormulaType.ATOM) {
    return [{ type: RowType.SUBFORMULA, subFormula: formula}];
  } else if(logic.FormulaType.binary.includes(formula.type)) {
    var leftRow = constructRow(formula.left);
    var rightRow = constructRow(formula.right);
    if(logic.FormulaType.needsBrackets(formula, formula.left)) {
      leftRow = [{ type: RowType.OPENBRACKET }].concat(leftRow).concat(
        [{ type: RowType.CLOSEBRACKET }]);
    }
    if(logic.FormulaType.needsBrackets(formula, formula.right)) {
      rightRow = [{ type: RowType.OPENBRACKET }].concat(rightRow).concat(
        [{ type: RowType.CLOSEBRACKET }]);
    }
    return leftRow.concat(
      [{ type: RowType.SUBFORMULA, subFormula: formula}]).concat(rightRow);
  } else if(logic.FormulaType.unary.includes(formula.type)
            || logic.FormulaType.quantification.includes(formula.type)) {
    var innerRow = constructRow(formula.innerFormula);
    if(logic.FormulaType.needsBrackets(formula, formula.innerFormula)) {
      innerRow = [{ type: RowType.OPENBRACKET }].concat(innerRow).concat(
        [{ type: RowType.CLOSEBRACKET }]);
    }
    return innerRow;
  }
  throw "unable to construct row for formula";
}

/* register functions: */
document.getElementById("formulaButtonInput").addEventListener("click", onConstructionButton);
document.getElementById("formulaTextInput").addEventListener("keyup",
  function(event) { if(event.keyCode === 13) { onConstructionButton(); } } );
