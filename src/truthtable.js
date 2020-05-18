const parser = require("./parser.js");
const logic = require("./logic.js");

const resultDiv = document.getElementById("result");
const inputDiv = document.getElementById("input");

logic.addFormulaInput(inputDiv, logic.booleanFormulaInstructions,
  (text) => {
    const formula = parser.parsePropositional(text);
    const headerRow = createHeaderRow(formula);
    const table = createTable(headerRow.atoms, headerRow.formulaRow);
    resultDiv.innerHTML = "";
    resultDiv.appendChild(table);
  });

const LEFT = "0";
const RIGHT = "1";

function throwNewInternalError(msg) {
  throw new Error(`An internal error occurred: ${msg}`);
}

function navigateToSubformula(formula, directions) {
  if(directions.length === 0) {
    return formula;
  } else {
    [currentDirection, ...remainingDirections] = directions;
    if(currentDirection === LEFT) {
      if(formula instanceof logic.BiImplication
        || formula instanceof logic.Implication
        || formula instanceof logic.Disjunction
        || formula instanceof logic.Conjunction) {
        return navigateToSubformula(formula.left, remainingDirections);
      } else if(formula instanceof Negation) {
        return navigateToSubformula(formula.inner, remainingDirections);
      } else {
        throwNewInternalError("Could not navigate to subformula.");
      }
    } else if(currentDirection === RIGHT) {
      if(formula instanceof logic.BiImplication
        || formula instanceof logic.Implication
        || formula instanceof logic.Disjunction
        || formula instanceof logic.Conjunction) {
        return navigateToSubformula(formula.right, remainingDirections);
      } else {
        throwNewInternalError("Could not navigate to subformula.");
      }
    }
  }
}

function createHeaderRow(formula) {

  const OPENINGBRACKET = {
    type: "string",
    value: "("
  };

  const CLOSINGBRACKET = {
    type: "string",
    value: ")"
  };

  function flatten(subFormula, currentPath) {
    if(subFormula instanceof logic.Proposition) {
      return [{
        type: "proposition",
        path: currentPath,
        formula: subFormula,
        original: formula.isEqualTo(subFormula)
      }];
    } else if(subFormula instanceof logic.Negation) {
      const current = {
        type: "negation",
        path: currentPath,
        innerPath: currentPath.concat([LEFT]),
        formula: subFormula,
        original: formula.isEqualTo(subFormula)
      };
      var next = flatten(subFormula.inner, currentPath.concat([LEFT]));
      if(subFormula.requiresBracketsInner()) {
        next = [OPENINGBRACKET].concat(next).concat([CLOSINGBRACKET]);
      }
      return [current].concat(next);
    } else {
      const current = {
        type: "binary",
        path: currentPath,
        leftPath: currentPath.concat([LEFT]),
        rightPath: currentPath.concat([RIGHT]),
        formula: subFormula,
        original: formula.isEqualTo(subFormula)
      };
      var left = flatten(subFormula.left, currentPath.concat([LEFT]));
      var right = flatten(subFormula.right, currentPath.concat([RIGHT]));
      if(subFormula.requiresBracketsLeft()) {
        left = [OPENINGBRACKET].concat(left).concat([CLOSINGBRACKET]);
      }
      if(subFormula.requiresBracketsRight()) {
        right = [OPENINGBRACKET].concat(right).concat([CLOSINGBRACKET]);
      }
      return left.concat([current]).concat(right);
    }
  }

  const atoms = formula.getAtoms().sort((x, y) => y.name < x.name);
  const formulaRow = flatten(formula, []);
  return {
    atoms: atoms,
    formulaRow: formulaRow
  };
}

function toggleMarkings(columnElement) {
  const elementType = columnElement.getAttribute("formulaType");
  if(elementType === "negation") {
    const innerPath = columnElement.getAttribute("innerPath");
    const innerColumn = document.getElementsByClassName(innerPath);
    for(const e of innerColumn) {
      e.classList.toggle("markedColumn");
    }
  } else if(elementType === "binary") {
    const leftPath = columnElement.getAttribute("leftPath");
    const rightPath = columnElement.getAttribute("rightPath");
    const leftColumn = document.getElementsByClassName(leftPath);
    const rightColumn = document.getElementsByClassName(rightPath);
    for(const e of leftColumn) {
      e.classList.toggle("markedColumn");
    }
    for(const e of rightColumn) {
      e.classList.toggle("markedColumn");
    }
  }
}

function enumerateInterpretations(atoms) {
  var head;
  var rest;
  if(atoms.length === 0) {
    return [];
  } else if(atoms.length === 1) {
    [head] = atoms;
    result = [new logic.PropositionValuation([]),
              new logic.PropositionValuation([head])];
    return result;
  } else {
    [head, ...rest] = atoms;
    const restInterpretations = enumerateInterpretations(rest);
    var newInterpretations = [];
    for(const oldInterpretation of restInterpretations) {
      const updatedInterpretation = new logic.PropositionValuation(
        [...oldInterpretation.truePropositions].concat([head]));
      newInterpretations.push(updatedInterpretation);
    }
    return restInterpretations.concat(newInterpretations)
  }
}

function createTable(atoms, formulae) {
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  table.appendChild(headerRow);
  const enumeratedInterpretations = enumerateInterpretations(atoms);
  for(var i = 0; i < atoms.length; i++) {
    const atomEntry = document.createElement("th");
    headerRow.appendChild(atomEntry);
    atomEntry.innerHTML = `<span class="code">${atoms[i].name}</span>`;
    if(i === 0) {
      atomEntry.classList.add("firstAtom");
    }
    if(i === atoms.length - 1) {
      atomEntry.classList.add("lastAtom");
    }
    atomEntry.classList.add("tableHeader");
    atomEntry.classList.add("atomHeader");
    atomEntry.classList.add("atomColumn");
  }
  for(var i = 0; i < formulae.length; i++) {
    const currentFormula = formulae[i];
    const formulaEntry = document.createElement("th");
    headerRow.appendChild(formulaEntry);
    if(i === 0) {
      formulaEntry.classList.add("firstFormula");
    }
    if(i === formulae.length - 1) {
      formulaEntry.classList.add("lastFormula");
    }
    formulaEntry.classList.add("tableHeader");
    formulaEntry.classList.add("formulaHeader");
    formulaEntry.classList.add("formulaColumn");
    if(currentFormula.type !== "string") {
      formulaEntry.addEventListener("mouseenter",
        (e) => {toggleMarkings(e.target)});
      formulaEntry.addEventListener("mouseleave",
        (e) => {toggleMarkings(e.target)});
      formulaEntry.setAttribute("formulaType", currentFormula.type);
      formulaEntry.classList.add("formulaContent");
      const pathStr = currentFormula.path.join("").toString();
      if(pathStr) {
        formulaEntry.classList.add(pathStr);
      }
      if(currentFormula.original) {
        formulaEntry.classList.add("originalFormula");
      }
      const representedFormula = currentFormula.formula;
      if(currentFormula.type === "proposition") {
        formulaEntry.innerHTML = `<span class="code">${representedFormula.name}</span>`;
      } else if(currentFormula.type === "negation") {
        formulaEntry.innerHTML = `<span class="code">~</span>`;
        const innerPath = currentFormula.innerPath.join("").toString();
        formulaEntry.setAttribute("innerpath", innerPath);
      } else if(currentFormula.type === "binary") {
        formulaEntry.innerHTML = `<span class="code">${representedFormula.symbol}</span>`;
        const leftPath = currentFormula.leftPath.join("").toString();
        const rightPath = currentFormula.rightPath.join("").toString();
        formulaEntry.setAttribute("leftpath", leftPath);
        formulaEntry.setAttribute("rightpath", rightPath);
      } else {
        /* ooops?! */
      }
    } else {
      formulaEntry.classList.add("formulaFiller");
      formulaEntry.innerHTML = `<span class="code">${currentFormula.value}</span>`;
    }
  }
  console.log(enumeratedInterpretations);
  for(var j = 0; j < enumeratedInterpretations.length; j++) {
    const valuation = enumeratedInterpretations[j];
    const currentRow = document.createElement("tr");
    if(j === 0) {
      currentRow.classList.add("firstValuation");
    }
    if(j === enumeratedInterpretations.length - 1) {
      currentRow.classList.add("lastValuation");
    }
    table.appendChild(currentRow);
    for(var i = 0; i < atoms.length; i++) {
      const atomEntry = document.createElement("td");
      currentRow.appendChild(atomEntry);
      const evaluatedValue = atoms[i].evaluate(valuation) ? "1" : "0";
      atomEntry.innerHTML = `<span class="code">${evaluatedValue}</span>`;
      if(i === 0) {
        atomEntry.classList.add("firstAtom");
      }
      if(i === atoms.length - 1) {
        atomEntry.classList.add("lastAtom");
      }
      atomEntry.classList.add("atomColumn");
    }
    for(var i = 0; i < formulae.length; i++) {
      const currentFormula = formulae[i];
      const formulaEntry = document.createElement("td");
      currentRow.appendChild(formulaEntry);
      if(i === 0) {
        formulaEntry.classList.add("firstFormula");
      }
      if(i === formulae.length - 1) {
        formulaEntry.classList.add("lastFormula");
      }
      formulaEntry.classList.add("formulaColumn");
      if(currentFormula.type !== "string") {
        formulaEntry.addEventListener("mouseenter",
          (e) => {toggleMarkings(e.target)});
        formulaEntry.addEventListener("mouseleave",
          (e) => {toggleMarkings(e.target)});
        formulaEntry.setAttribute("formulaType", currentFormula.type);
        formulaEntry.classList.add("formulaContent");
        const pathStr = currentFormula.path.join("").toString();
        if(pathStr) {
          formulaEntry.classList.add(pathStr);
        }
        if(currentFormula.original) {
          formulaEntry.classList.add("originalFormula");
        }
        const representedFormula = currentFormula.formula;
        const evaluatedValue = representedFormula.evaluate(valuation) ? "1" : "0";
        formulaEntry.innerHTML = `<span class="code">${evaluatedValue}</span>`;
        if(currentFormula.type === "proposition") {
          /* nothing to be done */
        } else if(currentFormula.type === "negation") {
          const innerPath = currentFormula.innerPath.join("").toString();
          formulaEntry.setAttribute("innerpath", innerPath);
        } else if(currentFormula.type === "binary") {
          const leftPath = currentFormula.leftPath.join("").toString();
          const rightPath = currentFormula.rightPath.join("").toString();
          formulaEntry.setAttribute("leftpath", leftPath);
          formulaEntry.setAttribute("rightpath", rightPath);
        } else {
          /* ooops?! */
        }
      } else {
        formulaEntry.classList.add("formulaFiller");
      }
    }
  }
  return table;
}
