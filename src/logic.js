var _FormulaType = {
  CONJUNCTION: 0,
  DISJUNCTION: 1,
  IMPLICATION: 2,
  BIIMPLICATION: 3,
  NEGATION: 4,
  UNIVERSAL: 5,
  EXISTENTIAL: 6,
  ATOM: 7,
  getStringRepresentation: function(element) {
    switch(element) {
      case this.CONJUNCTION:
        return "<conjunction>";
      case this.DISJUNCTION:
        return "<disjunction>";
      case this.IMPLICATION:
        return "<implication>";
      case this.BIIMPLICATION:
        return "<biimplication>";
      case this.NEGATION:
        return "<negation>";
      case this.UNIVERSAL:
        return "<universal-quantification>";
      case this.EXISTENTIAL:
        return "<existential-quantification>";
      case this.ATOM:
        return "<atom>";
      default:
        return "<unknown>";
    }
  },
  getFormulaConnective: function(element) {
    switch(element) {
      case this.CONJUNCTION:
        return "&";
      case this.DISJUNCTION:
        return "|";
      case this.IMPLICATION:
        return "=>";
      case this.BIIMPLICATION:
        return "<=>";
      case this.NEGATION:
        return "~";
      case this.UNIVERSAL:
        return "!";
      case this.EXISTENTIAL:
        return "?";
      case this.ATOM:
        return "";
      default:
        return "<unknown>";
    }
  }
}

_FormulaType.values = [
  _FormulaType.CONJUNCTION,
  _FormulaType.DISJUNCTION,
  _FormulaType.IMPLICATION,
  _FormulaType.ATOM,
  _FormulaType.BIIMPLICATION,
  _FormulaType.NEGATION,
  _FormulaType.UNIVERSAL,
  _FormulaType.EXISTENTIAL
];

_FormulaType.binary = [
  _FormulaType.CONJUNCTION,
  _FormulaType.DISJUNCTION,
  _FormulaType.IMPLICATION,
  _FormulaType.BIIMPLICATION
];

_FormulaType.quantification = [
  _FormulaType.UNIVERSAL,
  _FormulaType.EXISTENTIAL
];

_FormulaType.unary = [
  _FormulaType.NEGATION
];

_FormulaType.atomic = [
  _FormulaType.ATOM
];

const FormulaType = _FormulaType;

function Formula(type, first, second) {
  this.type = type;
  const strRep = FormulaType.getStringRepresentation(this.type);
  if(FormulaType.binary.includes(this.type)) {
    if(first === undefined || second === undefined) {
      throw {
        message: `Cannot construct binary formula ${strRep} with undefined branches`
      };
    }
    this.left = first;
    this.right = second;
  } else if(FormulaType.quantification.includes(this.type)) {
    if(first === undefined || second === undefined) {
      throw {
        message: `Cannot construct quantification ${strRep} with undefined variable or undefined formula`
      };
    }
    this.quantifiedVariable = first;
    this.innerFormula = second;
  } else if(FormulaType.unary.includes(this.type)) {
    if(second !== undefined) {
      console.warn(`Dismissing second argument ${second} for unary formula ${strRep}`);
    }
    this.inner = first;
  } else if(FormulaType.atomic.includes(this.type)) {
    if(second !== undefined) {
      console.warn(`Dismissing second argument ${second} for atomic formula`);
    }
    this.atom = first;
  }
}

function Variable(name) {
  this.name = name;
}

function Predicate(name, variableList) {
  this.name;
  this.variableList = variableList;
}

module.exports = {
  FormulaType: FormulaType,
  Formula: Formula,
  Variable: Variable,
  Predicate: Predicate,
};
