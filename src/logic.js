var _FormulaType = {
  BIIMPLICATION: 0,
  IMPLICATION: 1,
  DISJUNCTION: 2,
  CONJUNCTION: 3,
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
    this.innerFormula = first;
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

function getAtoms(formula) {
  if(formula.type === FormulaType.ATOM) {
    return [formula];
  } else if(FormulaType.binary.includes(formula.type)) {
    const leftAtoms = getAtoms(formula.left);
    const rightAtoms = getAtoms(formula.right);
    return leftAtoms.concat(rightAtoms);
  } else if(FormulaType.unary.includes(formula.type)
            || FormulaType.quantification.includes(formula.type)) {
    return getAtoms(self.innerFormula);
  }
}

function stringifyFormula(formula) {
  if(formula.type === FormulaType.ATOM) {
    const atom = formula.atom;
    var result = atom.name;
    if(atom.variableList) {
      var stringList = [];
      for(const element of atom.variableList) {
        stringList.append(element.name);
      }
      result += "(" + stringList.join(", ") + ")";
    }
    return result;
  } else if(FormulaType.binary.includes(formula.type)) {
    var leftStr = stringifyFormula(formula.left);
    var rightStr = stringifyFormula(formula.right);
    if(FormulaType.binary.includes(formula.left.type) && formula.left.type < formula.type) {
      leftStr = "(" + leftStr + ")";
    }
    if(FormulaType.binary.includes(formula.right.type) && formula.right.type < formula.type) {
      rightStr = "(" + rightStr + ")";
    }
    return leftStr + FormulaType.getFormulaConnective(formula.type) + rightStr;
  } else if(formula.type === FormulaType.NEGATION) {
    var innerStr = stringifyFormula(formula.innerFormula);
    if(FormulaType.binary.includes(formula.innerFormula.type)) {
      innerStr = "(" + innerStr + ")";
    }
    return "~" + innerStr;
  } else if(FormulaType.quantification.includes(formula.type)) {
    var innerStr = stringifyFormula(formula.innerFormula);
    if(FormulaType.binary.includes(formula.innerFormula.type)) {
      innerStr = "(" + innerStr + ")";
    }
    var quantification;
    if(formula.type === FormulaType.UNIVERSAL) {
      quantification = "![" + formula.quantifiedVariable.name + "]:";
    } else if(formula.type === FormulaType.EXISTENTIAL) {
      quantification = "?[" + formula.quantifiedVariable.name + "]:";
    } else {
      throw "unexpected quantification";
    }
    return quantification + innerStr;
  }
}

module.exports = {
  FormulaType: FormulaType,
  Formula: Formula,
  Variable: Variable,
  Predicate: Predicate,
  stringifyFormula: stringifyFormula,
  getAtoms: getAtoms
};
