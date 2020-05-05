const parsers = require("./parsers.js");
const Konva = require("konva");
const logic = require("./logic.js");

const stage = new Konva.Stage({
  container: "input",
  width: window.innerWidth,
  height: window.innerHeight - 600,
  visible: true,
});

const layer = new Konva.Layer();

var universe = [];
var edges = [];

const colors = ["white", "red", "blue", "green"];

var dragOrigin = null;

function nextColor(current) {
  const currentIndex = colors.indexOf(current);
  const nextIndex = (currentIndex + 1) % colors.length;
  return colors[nextIndex];
}

function colorNode(node) {
  const currentColor = node.attrs.fill;
  const next = nextColor(currentColor);
  node.fill(next);
  layer.draw();
}

function connectNodes(source, target) {
  edges.push([source, target]);
  edges.push([target, source]);
  originX = source.attrs.x;
  originY = source.attrs.y;
  targetX = target.attrs.x;
  targetY = target.attrs.y;
  const line = new Konva.Line({
    points: [originX, originY, targetX, targetY],
    stroke: 'black',
    strokeWidth: 2
  });
  layer.add(line);
  line.moveToBottom();
  layer.draw();
}

function executeDrag(target) {
  const source = dragOrigin;
  if(source === target) {
    colorNode(source);
  } else {
    connectNodes(source, target)
  }
}
function createNewNode(x, y) {
  const newCircle = new Konva.Circle({
    x: x,
    y: y,
    radius: 20,
    stroke: 'black',
    fill: 'white',
    strokewidth: 2
  });

  const newGuard = new Konva.Circle({
    x: x,
    y: y,
    radius: 46,
    stroke: 'transparent',
    fill: 'transparent',
    strokewidth: 0
  });

  newGuard.on("dblclick", function(event) {
    event.cancelBubble = true;
  });

  newCircle.on("dblclick", function(event) {
    event.cancelBubble = true;
  });

  newCircle.on("mousedown", function(event) {
    dragOrigin = event.currentTarget;
  });

  newCircle.on("mouseup", function(event) {
    executeDrag(event.currentTarget);
  });

  universe.push(newCircle);
  layer.add(newCircle);
  layer.add(newGuard);
  newGuard.moveToTop();
  newCircle.moveToTop();

  layer.draw();
}

stage.on("dblclick", function(event) {
  const x = event.evt.layerX;
  const y = event.evt.layerY;
  createNewNode(x, y);
});

stage.add(layer);
layer.draw();

function extractInterpretation() {
  var extractedUniverse = [];
  var extractedEdges = [];
  for(var index = 0; index < universe.length; index++) {
    extractedUniverse[index] = {
      color: universe[index].attrs.fill,
      id: index,
      x: universe[index].attrs.x,
      y: universe[index].attrs.y
    };
  }
  for(const edge of edges) {
    [source, target] = edge;
    const sourceX = source.attrs.x;
    const sourceY = source.attrs.y;
    const targetX = target.attrs.x;
    const targetY = target.attrs.y;
    var sourceId = undefined;
    var targetId = undefined;
    for(const element of extractedUniverse) {
      if(element.x === sourceX && element.y === sourceY) {
        sourceId = element.id;
      }
      if(element.x === targetX && element.y === targetY) {
        targetId = element.id;
      }
      if(sourceId !== undefined && targetId !== undefined) {
        break;
      }
    }
    if(sourceId === undefined || targetId === undefined) {
      throw {
        message: `cannot map edge ${edge} to universe`
      };
    }
    extractedEdges.push([sourceId, targetId]);
  }
  return new Interpretation(extractedUniverse, extractedEdges);
}

function Interpretation(universe, edges) {
  this.universe = universe;
  this.edges = edges;
  this.mapping = {};
  this.quantifyVariable = function(quantifiedVariable) {
    var quantifiedInterpretations = [];
    for(const element of this.universe) {
      var newInterpretation = new Interpretation(this.universe, this.edges);
      for(key in this.mapping) {
        newInterpretation.mapping[key] = this.mapping[key];
      }
      newInterpretation.mapping[quantifiedVariable.name] = element.id;
      quantifiedInterpretations.push(newInterpretation);
    }
    return quantifiedInterpretations;
  };
  this.evaluateAtom = function(atom) {
    if(atom.name === "=") {
      [f, s] = atom.variableList;
      return this.mapping[f.name] === this.mapping[s.name];
    } else if(atom.name === "E") {
      [f, s] = atom.variableList;
      if(!(f.name in this.mapping)) {
        throw {
          message: `Unbounded variable ${f.name} in ${atom.name}(${f.name}, ${s.name})`
        }
      }
      if(!(s.name in this.mapping)) {
        throw {
          message: `Unbounded variable ${s.name} in ${atom.name}(${f.name}, ${s.name})`
        }
      }
      const fId = this.mapping[f.name];
      const sId = this.mapping[s.name];
      for(const edge of this.edges) {
        [i, j] = edge;
        if(i === fId && j === sId) {
          return true;
        }
      }
      return false;
    } else {
      [f] = atom.variableList;
      if(!(f.name in this.mapping)) {
        throw {
          message: `Unbounded variable ${f.name} in ${atom.name}(${f.name})`
        }
      }
      const fElement = this.universe[this.mapping[f.name]];
      if(atom.name === "Red") {
        return fElement.color === "red";
      } else if(atom.name === "Green") {
        return fElement.color === "green";
      } else if(atom.name === "Blue") {
        return fElement.color === "blue";
      } else {
        throw {
          message: "Undefined predicate ${atom.name}/${atom.variableList.length}"
        }
      }
    }
  };
}

function checkAtoms(formula) {
  const allowedAtoms = [
    {
      name: "E",
      arity: 2
    }, {
      name: "=",
      arity: 2
    }, {
      name: "Red",
      arity: 1,
    }, {
      name: "Blue",
      arity: 1,
    }, {
      name: "Green",
      arity: 1,
    }
  ];
  var allowedAtomsStrings = [];
  for(const allowedAtom of allowedAtoms) {
    allowedAtomsStrings.push(`${allowedAtom.name}/${allowedAtom.arity}`);
  }
  const helpString = allowedAtomsStrings.join(", ");
  const atoms = logic.getAtoms(formula);
  for(const atom of atoms) {
    const name = atom.name;
    const arity = atom.variableList.length;
    var isValid = false;
    for(const allowedAtom of allowedAtoms) {
      if(name === allowedAtom.name && arity === allowedAtom.arity) {
        isValid = true;
        break;
      }
    }
    if(isValid) {
      continue;
    }
    return {
      type: parsers.ParseResult.FAILURE,
      message: `Unknown predicate ${name}/${arity}; only predicates ${helpString} are allowed`
    };
  }
  return {
    type: parsers.ParseResult.SUCCESS,
    formula: formula
  }
}


function onConstructionButton() {
  const textInput = document.getElementById("formulaTextInput");
  const resultDiv = document.getElementById("result");
  const formulaText = textInput.value;


  function displayFailure(msg) {
    resultDiv.classList.add("failure");

    var innerText = msg.message;
    if(msg.location) {
      innerText += ` Check ${msg.location.start.column}-th character.`
    }
    resultDiv.appendChild(document.createTextNode(innerText));
    console.warn(msg);
  }

  function displayResult(formulaText, result) {
    resultDiv.classList.add("success");
    const formulaSpan = document.createElement("span");
    formulaSpan.classList.add("inlineCode");
    formulaSpan.appendChild(document.createTextNode(formulaText));
    const prefix = document.createTextNode("The formula ");
    const middle = document.createTextNode(" evaluates to ");
    const msg = document.createTextNode(result);
    resultDiv.appendChild(prefix);
    resultDiv.appendChild(formulaSpan);
    resultDiv.appendChild(middle);
    resultDiv.appendChild(msg);
  }

  /* clearing results: */
  resultDiv.classList.remove("success");
  resultDiv.classList.remove("failure");
  resultDiv.textContent = "";

  var result = parsers.parseFoFormula(formulaText);

  if(result.type === parsers.ParseResult.FAILURE) {
    displayFailure(result);
    return;
  }
  result = checkAtoms(result.formula);

  if(result.type === parsers.ParseResult.FAILURE) {
    displayFailure(result);
    return;
  }

  try {
    const interpretation = extractInterpretation();
    const evaluationResult = logic.evaluate(result.formula, interpretation);
    displayResult(formulaText, evaluationResult);
  } catch(err) {
    displayFailure(err);
    return;
  }
}

/* formula stuff: */
document.getElementById("formulaButtonInput").addEventListener("click", onConstructionButton);
document.getElementById("formulaTextInput").addEventListener("keyup",
  function(event) { if(event.keyCode === 13) { onConstructionButton(); } } );
