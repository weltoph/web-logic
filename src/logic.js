class Variable {
  name;

  constructor(name) {
    this.name = name;
  }

  isEqualTo(other) {
    if(other instanceof Variable) {
      return this.name === other.name;
    } else {
      return false;
    }
  }

  toString() {
    return this.name;
  }
}

class Model {
  constructor() {
    if(this.constructor == Model) {
      throw new Error("Cannot instantiate abstract Model.");
    }
  }

  /* necessary */
  evaluateAtom(atom) {
    throw new Error("Cannot call abstract method.");
  }

  /* optional */
  quantifyVariable(variable) {
    throw new Error("Cannot call abstract method.");
  }
}

class Formula {
  precedence = undefined;

  constructor() {
    if(this.constructor == Formula) {
      throw new Error("Cannot instantiate abstract Formula.");
    }
  }

  isEqualTo(other) {
    throw new Error("Cannot call abstract method.");
  }

  evaluate(model) {
    throw new Error("Cannot call abstract method.");
  }

  toString() {
    throw new Error("Cannot call abstract method.");
  }

  getAtoms() {
    throw new Error("Cannot call abstract method.");
  }
}

class UnaryConnective extends Formula {
  inner;

  constructor(inner) {
    super();
    if(this.constructor == UnaryConnective) {
      throw new Error("Cannot instantiate abstract UnaryConnective.");
    }
    if(!(inner instanceof Formula)) {
      throw new Error("Requires inner argument to be a Formula.");
    }
    this.inner = inner;
    this.precedence = 4;
  }

  requiresBracketsInner() {
    return this.inner.precedence < this.precedence;
  }

  getAtoms() {
    return this.inner.getAtoms();
  }
}

class BinaryConnective extends Formula {
  left;
  right;

  constructor(left, right) {
    super();
    if(this.constructor == BinaryConnective) {
      throw new Error("Cannot instantiate abstract BinaryConnective.");
    }
    if(!(left instanceof Formula)) {
      throw new Error("Requires left argument to be a Formula.");
    }
    if(!(right instanceof Formula)) {
      throw new Error("Requires right argument to be a Formula.");
    }
    this.left = left;
    this.right = right;
  }

  requiresBracketsLeft() {
    return this.left.precedence < this.precedence;
  }

  requiresBracketsRight() {
    return this.right.precedence < this.precedence;
  }

  isEqualTo(other) {
    if(other instanceof this.constructor) {
      return (this.left.isEqualTo(other.left)
              && this.right.isEqualTo(other.right));
    } else {
      return false;
    }
  }

  toString() {
    if(this.requiresBracketsLeft()) {
      const leftStr = "(" + this.left.toString() + ")";
    } else {
      const leftStr = this.left.toString();
    }
    if(this.requiresBracketsRight()) {
      const rightStr = "(" + this.right.toString() + ")";
    } else {
      const rightStr = this.right.toString();
    }
    return leftStr + this.symbol + rightStr;
  }

  getAtoms() {
    const leftAtoms = this.left.getAtoms();
    const rightAtoms = this.right.getAtoms();
    var result = [];
    for(const atom of leftAtoms.concat(rightAtoms)) {
      if(!result.filter(a => atom.isEqualTo(a)).length) {
        result.push(atom);
      }
    }
    return result;
  }
}

class BiImplication extends BinaryConnective {
  symbol = "<=>";
  precedence = 0;

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return (leftResult && rightResult) || (!leftResult && !rightResult);
  }

}

class Implication extends BinaryConnective {
  symbol = "=>";
  precedence = 1;

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return !leftResult || rightResult;
  }
}

class Disjunction extends BinaryConnective {
  symbol = "|";
  precedence = 2;

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return leftResult || rightResult;
  }
}

class Conjunction extends BinaryConnective {
  symbol = "&";
  precedence = 3;

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return leftResult && rightResult;
  }
}

class Negation extends UnaryConnective {
  evaluate(model) {
    const innerResult = this.inner.evaluate(model);
    return !innerResult;
  }

  isEqualTo(other) {
    if(other instanceof this.constructor) {
      return this.inner.isEqualTo(other.inner);
    } else {
      return false;
    }
  }

  toString() {
    if(this.requiresBracketsInner()) {
      const innerStr = "(" + this.inner.toString() + ")";
    } else {
      const innerStr = this.inner.toString();
    }
    return "~" + innerStr;
  }
}


class Universal extends UnaryConnective {
  variable;

  constructor(variable, inner) {
    super(inner);
    if(!(variable instanceof Variable)) {
      throw new Error("Universal requires variable to be a Variable.");
    }
    this.variable = variable;
  }

  evaluate(model) {
    for(const quantifiedModel of model.quantifyVariable(this.variable)) {
      const quantificationResult = this.inner.evaluate(quantifiedModel);
      if(!quantificationResult) {
        return false;
      }
    }
    return true;
  }

  isEqualTo(other) {
    if(other instanceof this.constructor) {
      return (this.variable.isEqualTo(other.variable)
        && this.inner.isEqualTo(other.inner));
    } else {
      return false;
    }
  }

  toString() {
    if(this.requiresBracketsInner()) {
      const innerStr = "(" + this.inner.toString() + ")";
    } else {
      const innerStr = this.inner.toString();
    }
    const quantification = "! " + this.variable.name + ".";
    return quantification + innerStr;
  }
}

class Existential extends UnaryConnective {
  variable;

  constructor(variable, inner) {
    super(inner);
    if(!(variable instanceof Variable)) {
      throw new Error("Existential requires variable to be a Variable.");
    }
    this.variable = variable;
  }

  evaluate(model) {
    for(const quantifiedModel of model.quantifyVariable(this.variable)) {
      const quantificationResult = this.inner.evaluate(quantifiedModel);
      if(quantificationResult) {
        return true;
      }
    }
    return false;
  }

  isEqualTo(other) {
    if(other instanceof this.constructor) {
      return (this.variable.isEqualTo(other.variable)
        && this.inner.isEqualTo(other.inner));
    } else {
      return false;
    }
  }

  toString() {
    if(this.requiresBracketsInner()) {
      const innerStr = "(" + this.inner.toString() + ")";
    } else {
      const innerStr = this.inner.toString();
    }
    const quantification = "? " + this.variable.name + ".";
    return quantification + innerStr;
  }
}

class Atom extends Formula {
  constructor() {
    super();
    if(this.constructor == Atom) {
      throw new Error("Cannot instantiate abstract Atom.");
    }
    this.precedence = 5;
  }

  evaluate(model) {
    return model.evaluateAtom(this);
  }

  getAtoms() {
    return [this];
  }
}

class Predicate extends Atom {
  name;
  variables;

  constructor(name, variables) {
    super();
    this.name = name;
    this.variables = this.variables;
  }

  toString() {
    const variableList = this.variables.map(x => x.name).join(", ");
    return this.name + "(" + variableList + ")";
  }

  isEqualTo(other) {
    if(other instanceof Predicate && this.name === other.name
      && this.variables.length === other.variables.length) {
      reducer = (result, currentVar, currentIndex) => result |= currentVar.isEqualTo(other.variables[currentIndex])
      return this.variables.reduce(reducer, true);
    } else {
      return false;
    }
  }
}

class Equality extends Atom {
  leftVariable;
  rightVariable;

  constructor(leftVariable, rightVariable) {
    this.leftVariable = leftVariable;
    this.rightVariable = this.rightVariable;
  }

  toString() {
    const leftVar = this.leftVariable.toString();
    const rightVar = this.rightVariable.toString();
    return leftVar + "=" + rightVar;
  }

  isEqualTo(other) {
    if(other instanceof Equality) {
      return this.leftVariable.isEqualTo(other.leftVariable) && this.rightVariable(other.rightVariable);
    } else {
      return false;
    }
  }
}

class Proposition extends Atom {
  name;

  constructor(name) {
    super();
    this.name = name;
  }

  toString() {
    return this.name;
  }

  isEqualTo(other) {
    return other instanceof Proposition && this.name == other.name;
  }
}

function plInterpretation(trueVariables) {
  this.trueVariables = trueVariables;
  this.evaluateAtom = function(variable) {
    return (trueVariables.includes(variable)
      || trueVariables.includes(variable.name));
  }
}

module.exports = {
  Variable: Variable,
  Model: Model,
  BiImplication: BiImplication,
  Implication: Implication,
  Disjunction: Disjunction,
  Conjunction: Conjunction,
  Negation: Negation,
  Universal: Universal,
  Existential: Existential,
  Predicate: Predicate,
  Equality: Equality,
  Proposition: Proposition
};
