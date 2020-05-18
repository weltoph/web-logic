const parser = require("./parser.js");
const Konva = require("konva");
const logic = require("./logic.js");

const stage = new Konva.Stage({
  container: "canvas",
  width: window.innerWidth,
  height: window.innerHeight - 200,
  visible: true,
});

const instructions = `
  Create a simple colored graph by
  <ul>
    <li>creating nodes by double clicking the canvas,</li>
    <li>coloring nodes by clicking them (the available color states are red,
      blue, green and uncolored and clicking nodes cycles them through these
      states), and</li>
    <li>adding edges by dragging from one node to another.</li>
  </ul>

  Give a first-order sentence in the text box below which you can then
  evaluate on your graph. The signature is
  <ul>
    <li><span class="code">E/2</span> which is instantiated with the
      edge relation,</li>
    <li><span class="code">=/2</span> which is equality (note that it
      is used inline, i.e. <span class="code">x = y</span>),</li>
    <li><span class="code">Red/1</span> which is the set of all red
      nodes,</li>
    <li><span class="code">Blue/1</span> which is the set of all blue
      nodes, and</li>
    <li><span class="code">Green/1</span> which is the set of all
      green nodes.</li>
  </ul>
  Universal and existential quantifications are written as
  <span class="code">!x. (...)</span> and
  <span class="code">?x. (...)</span> respectively. Examples are
  <ul>
    <li>
      <span class="code">
        ? b . ( Blue(b) & ! o . ( ~ o = b => E(o, b) ) )
      </span>
      to describe that there is one blue node which is adjacent to all
      others, and
    </li>
    <li>
      <span class="code">
        ! x . ( Blue(x) | ? y . (E(x, y) & Blue(y)))
      </span>
      to state that every node is either blue or adjacent to a blue node.
    </li>
  </ul>
`;

const inputDiv = document.getElementById("input");
const resultDiv = document.getElementById("result");

logic.addFormulaInput(inputDiv,
  instructions,
  (text) => {
    const formula = parser.parseFirstOrder(text);
    checkAtoms(formula);
    const interpretation = extractInterpretation();
    const result = formula.evaluate(interpretation);
    resultDiv.innerHTML = `
      <p>
        The graph is ${result ? "" : "not"} a model of
        <span class="code">
          ${formula.toString()}
        </span>.
      </p>
    `;
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
    if(atom instanceof logic.Equality) {
      const f = atom.leftVariable;
      const s = atom.rightVariable;
      return this.mapping[f.name] === this.mapping[s.name];
    } else if(atom.name === "E") {
      [f, s] = atom.variables;
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
      [f] = atom.variables;
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
          message: "Undefined predicate ${atom.name}/${atom.variables.length}"
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
  const helpString = allowedAtoms
    .map(allowedAtom => {return `${allowedAtom.name}/${allowedAtom.arity}`;})
    .join(", ");
  const atoms = formula.getAtoms();
  for(const atom of atoms) {
    var arity;
    var name;
    if(atom instanceof logic.Predicate) {
      name = atom.name;
      arity = atom.variables.length;
    } else if(atom instanceof logic.Equality) {
      name = "=";
      arity = 2;
    } else {
      throw new Error("Unexpected atom in formula.");
    }
    const fitting = allowedAtoms.filter(allowedAtom => {
      return allowedAtom.name === name && allowedAtom.arity === arity });
    if(fitting.length === 0) {
      throw new Error(
        `Unknown predicate ${name}/${arity}. Only ${helpString} are allowed.`);
    }
  }
}
