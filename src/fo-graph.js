const Konva = require("konva");
const stage = new Konva.Stage({
  container: "input",
  width: window.innerWidth,
  height: window.innerHeight - 400,
  visible: true,
});

const layer = new Konva.Layer();

var universe = [];
var edges = [];

const colors = ["white", "red", "blue", "green"];

var dragOrigin = null;

function nextColor(current) {
  console.log(current);
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
