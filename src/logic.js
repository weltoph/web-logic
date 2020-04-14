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
  },
  needsBrackets: function(topFormula, subFormula) {
    if( (subFormula.type === this.NEGATION)
      ||(subFormula.type === this.UNIVERSAL)
      ||(subFormula.type === this.EXISTENTIAL)
      ||(subFormula.type === this.ATOM)) {
      return false;
    } else if((topFormula.type === this.NEGATION)
            ||(topFormula.type === this.UNIVERSAL)
            ||(topFormula.type === this.EXISTENTIAL)) {
      return true;
    } else {
      return subFormula.type < topFormula.type;
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
    this.name = first;
    if(second) {
      this.variableList = second;
    }
  }
}

function evaluate(formula, interpretation) {
  if(FormulaType.binary.includes(formula.type)) {
    const leftEvaluation = evaluate(formula.left, interpretation);
    const rightEvaluation = evaluate(formula.right, interpretation);
    if(formula.type === FormulaType.BIIMPLICATION) {
      return ((leftEvaluation && rightEvaluation)
              || (!leftEvaluation && !rightEvaluation));
    } else if(formula.type === FormulaType.IMPLICATION) {
      return (!leftEvaluation || rightEvaluation);
    } else if(formula.type === FormulaType.DISJUNCTION) {
      return (leftEvaluation || rightEvaluation);
    } else if(formula.type === FormulaType.CONJUNCTION) {
      return (leftEvaluation && rightEvaluation);
    }
  } else if(formula.type === FormulaType.NEGATION) {
    const innerEvaluation = evaluate(formula.innerFormula, interpretation);
    return !innerEvaluation;
  } else if(FormulaType.quantification.includes(formula.type)) {
    const quantifiedInterpretations = interpretation.quantifyVariable(formula.quantifiedVariable);
    for(const derivedInterpretation of quantifiedInterpretations) {
      const quantifiedResult = evaluate(formula.innerFormula, derivedInterpretation);
      if(formula.type === FormulaType.UNIVERSAL && !quantifiedResult) {
        return false;
      } else if(formula.type === FormulaType.EXISTENTIAL && quantifiedResult) {
        return true;
      } else {
        continue;
      }
    }
    if(formula.type === FormulaType.UNIVERSAL) {
      return true;
    } else if(formula.type === FormulaType.UNIVERSAL) {
      return false;
    } else {
      throw "unexpected formula type";
    }
  } else if(formula.type === FormulaType.ATOM) {
    return interpretation.evaluateAtom(formula);
  }
}

function plInterpretation(trueVariables) {
  this.trueVariables = trueVariables;
  this.evaluateAtom = function(variable) {
    return (trueVariables.includes(variable)
      || trueVariables.includes(variable.name));
  }
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
    return getAtoms(formula.innerFormula);
  }
}

module.exports = {
  FormulaType: FormulaType,
  Formula: Formula,
  getAtoms: getAtoms,
  evaluate: evaluate,
  plInterpretation: plInterpretation
};
