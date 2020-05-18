class Variable {
  // name;

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
  // precedence = undefined;

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
  // inner;

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
  // left;
  // right;

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
    var leftStr = this.left.toString();
    if(this.requiresBracketsLeft()) {
      leftStr = `(${leftStr})`
    }
    var rightStr = this.right.toString();
    if(this.requiresBracketsRight()) {
      rightStr = `(${rightStr})`;
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
  constructor(left, right) {
    super(left, right);
    this.symbol = "<=>";
    this.precedence = 0;
  }

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return (leftResult && rightResult) || (!leftResult && !rightResult);
  }

}

class Implication extends BinaryConnective {
  constructor(left, right) {
    super(left, right);
    this.symbol = "=>";
    this.precedence = 1;
  }

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return !leftResult || rightResult;
  }
}

class Disjunction extends BinaryConnective {
  constructor(left, right) {
    super(left, right);
    this.symbol = "|";
    this.precedence = 2;
  }

  evaluate(model) {
    const leftResult = this.left.evaluate(model);
    const rightResult = this.right.evaluate(model);
    return leftResult || rightResult;
  }
}

class Conjunction extends BinaryConnective {
  constructor(left, right) {
    super(left, right);
    this.symbol = "&";
    this.precedence = 3;
  }

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
    var innerStr = this.inner.toString();
    if(this.requiresBracketsInner()) {
      innerStr = `(${innerStr})`;
    }
    return `~${innerStr}`;
  }
}


class Universal extends UnaryConnective {
  // variable;

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
    var innerStr = this.inner.toString();
    if(this.requiresBracketsInner()) {
      innerStr = `(${innerStr})`
    }
    return `! ${this.variable.name}.${innerStr}`;
  }
}

class Existential extends UnaryConnective {
  // variable;

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
    var innerStr = this.inner.toString();
    if(this.requiresBracketsInner()) {
      innerStr = `(${innerStr})`
    }
    const quantification = "? " + this.variable.name + ".";
    return `? ${this.variable.name}.${innerStr}`;
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
  // name;
  // variables;

  constructor(name, variables) {
    super();
    this.name = name;
    this.variables = variables;
  }

  toString() {
    const variableList = this.variables.map(x => x.name).join(", ");
    return this.name + "(" + variableList + ")";
  }

  isEqualTo(other) {
    if(other instanceof Predicate && this.name === other.name
      && this.variables.length === other.variables.length) {
      const reducer = (result, currentVar, currentIndex) => result |= currentVar.isEqualTo(other.variables[currentIndex])
      return this.variables.reduce(reducer, true);
    } else {
      return false;
    }
  }
}

class Equality extends Atom {
  // leftVariable;
  // rightVariable;

  constructor(leftVariable, rightVariable) {
    super();
    this.leftVariable = leftVariable;
    this.rightVariable = rightVariable;
  }

  toString() {
    const leftVar = this.leftVariable.toString();
    const rightVar = this.rightVariable.toString();
    return leftVar + "=" + rightVar;
  }

  isEqualTo(other) {
    if(other instanceof Equality) {
      return this.leftVariable.isEqualTo(other.leftVariable) && this.rightVariable.isEqualTo(other.rightVariable);
    } else {
      return false;
    }
  }
}

class Proposition extends Atom {
  // name;

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

class PropositionValuation extends Model {
  constructor(truePropositions) {
    super();
    for(const variable of truePropositions) {
      if(!(variable instanceof Proposition)) {
        throw new Error("PropositionValuation valuates Propositions.");
      }
    }
    this.truePropositions = truePropositions;
  }

  evaluateAtom(atom) {
    const occurences = this.truePropositions.filter(
      proposition => proposition.isEqualTo(atom))
    return occurences.length > 0
  }
}

const booleanFormulaInstructions = `
  The Boolean connectives in descending order of precedence are
  <ul>
    <li><span class="code">~</span> for negation,</li>
    <li><span class="code">&amp;</span> for conjunction,</li>
    <li><span class="code">|</span> for disjunction,</li>
    <li><span class="code">=&gt;</span> for implication, and</li>
    <li><span class="code">&lt;=&gt;</span> for biimplication.</li>
  </ul>
  Some examples for formulae are
  <ul>
    <li><span class="code">~A =&gt; B | (C &lt;=&gt; A)</span>
      which is equivalent to
      <span class="code">((~A) =&gt; (B | (C &lt;=&gt; A)))</span>,</li>
    <li><span class="code">A &amp; B &amp; C =&gt; D</span>
      which is an example of a Horn-formula and equivalent to
      <span class="code">(A &amp; (B &amp; C)) =&gt; D</span>.
  </ul>`;

function addFormulaInput(container, popupText, callbackFct) {
  const addedBox = document.createElement("div");
  addedBox.classList.add("formula-input-outer-container");

  const inputText = document.createElement("input");
  inputText.classList.add("formula-input-field");
  inputText.type = "text";

  const instructionModal = document.createElement("div");
  instructionModal.classList.add("popup-box");

  const instructionContent = document.createElement("div");
  instructionContent.classList.add("popup-content");
  instructionModal.appendChild(instructionContent);

  const instructionClose = document.createElement("button");
  instructionClose.classList.add("popup-box-close");
  instructionClose.innerHTML = "&times;";
  instructionContent.appendChild(instructionClose);

  const instructionText = document.createElement("p");
  instructionContent.appendChild(instructionText);

  const buttonBox = document.createElement("div");
  buttonBox.classList.add("formula-input-button-container");
  const instructionBtn = document.createElement("button");
  instructionBtn.innerText = "Instructions";
  instructionBtn.addEventListener("click", () => {
    instructionText.innerHTML = popupText;
    instructionModal.style.display = "block";
  });

  instructionClose.addEventListener("click", () => {
    instructionText.innerHTML = "";
    instructionModal.style.display = "none";
  });

  const parseBtn = document.createElement("button");
  parseBtn.innerText = "Go";
  instructionBtn.classList.add("formula-input-btn");
  parseBtn.classList.add("formula-input-btn");
  buttonBox.appendChild(instructionBtn);
  buttonBox.appendChild(parseBtn);
  const computeInput = function(){
    try {
      callbackFct(inputText.value);
    } catch(err) {
      instructionText.innerHTML = err.message;
      instructionModal.style.display = "block";
      throw err;
    }
  };
  parseBtn.addEventListener("click", computeInput);
  inputText.addEventListener("keyup", event => {
    if(event.keyCode === 13) {
      event.preventDefault();
      computeInput();
    }
  });

  addedBox.appendChild(inputText);
  addedBox.appendChild(buttonBox);

  document.body.appendChild(instructionModal);
  document.body.addEventListener("keyup", (event) => {
    if(event.key === "Escape") {
      if(instructionModal.style.display == "block") {
        instructionModal.style.display = "none";
      }
    }
  });
  container.appendChild(addedBox);
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
  Proposition: Proposition,
  PropositionValuation: PropositionValuation,
  addFormulaInput: addFormulaInput,
  booleanFormulaInstructions: booleanFormulaInstructions
};
