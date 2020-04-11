const booleanGrammar = `
formula = ws inner:biimplication ws { return inner; }
biimplication = f:implication ws "<=>" ws s:biimplication { return new Formula(FormulaType.BIIMPLICATION, f, s); }
              / bottom:implication { return bottom; }
implication = f:disjunction ws "=>" ws s:implication { return new Formula(FormulaType.IMPLICATION, f, s); }
            / bottom:disjunction { return bottom; }
disjunction = f:conjunction ws "|" ws s:disjunction { return new Formula(FormulaType.DISJUNCTION, f, s); }
            / bottom:conjunction { return bottom; }
conjunction = f:negation ws "&" ws s:conjunction { return new Formula(FormulaType.CONJUNCTION, f, s); }
            / bottom:negation { return bottom; }
negation = "~" ws inner:negation { return new Formula(FormulaType.NEGATION, inner); }
            / bottom:atom { return bottom; }

variable = ws name:[a-zA-Z]+ ws { return new Variable(name); }
variableList = ws f:variable ws "," ws r:variableList{ return [f].concat(r); }
             / ws l:variable ws { return [l] };

ws = [" "]*
`;

const foGrammar = `
${booleanGrammar}

atom = alone:predicate { return alone; }
     / alone:quantification { return alone; }
     / "(" ws alone:formula ws ")" { return alone; }

predicate = name:[a-zA-Z]+ "(" ws variableList:variableList ws ")" { return new Formula(FormulaType.ATOM, new Predicate(name, variableList)); }
quantification = "!" ws "[" ws variableList:variableList ws "]" ws ":" inner:negation {
                    f = null;
                    for(quantifiedVariable of variableList.reverse()) {
                      if(f === null) {
                        f = new Formula(FormulaType.UNIVERSAL, quantifiedVariable, inner);
                      } else {
                        f = new Formula(FormulaType.UNIVERSAL, quantifiedVariable, f);
                      }
                    }
                    return f;
                  }
               / "?" ws "[" ws variableList:variableList ws "]" ws ":" inner:negation {
                    f = null;
                    for(quantifiedVariable of variableList.reverse()) {
                      if(f === null) {
                        f = new Formula(FormulaType.EXISTENTIAL, quantifiedVariable, inner);
                      } else {
                        f = new Formula(FormulaType.EXISTENTIAL, quantifiedVariable, f);
                      }
                    }
                    return f;
                  }
`;

const propositionalGrammar = `
${booleanGrammar}

atom = variable:variable { return new Formula(FormulaType.ATOM, variable); }
     / "(" ws alone:formula ws ")" { return alone; }
`;

const FormulaType = {
  CONJUNCTION: 0,
  DISJUNCTION: 1,
  IMPLICATION: 2,
  BIIMPLICATION: 3,
  NEGATION: 4,
  UNIVERSAL: 5,
  EXISTENTIAL: 6,
  ATOM: 7,
  values: [this.CONJUNCTION, this.DISJUNCTION, this.IMPLICATION,
           this.BIIMPLICATION, this.NEGATION, this.UNIVERSAL, this.EXISTENTIAL,
           this.ATOM],
  binary: [this.CONJUNCTION, this.DISJUNCTION, this.IMPLICATION,
           this.BIIMPLICATION],
  quantification: [this.UNIVERSAL, this.EXISTENTIAL],
  unary:  [this.NEGATION],
  atomic: [this.ATOM],
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

function Formula(type, first, second) {
  this.type = type;
  strRep = FormulaType.getStringRepresentation(this.type);
  if(type in FormulaType.binary) {
    if(first === undefined || second === undefined) {
      throw {
        message: "Cannot construct binary formula ${strRep} with undefined branches"
      };
    }
    this.left = first;
    this.right = second;
  } else if(type in FormulaType.quantification) {
    if(first === undefined || second === undefined) {
      throw {
        message: "Cannot construct quantification ${strRep} with undefined variable or undefined formula"
      };
    }
    this.quantifiedVariable = first;
    this.innerFormula = second;
  } else if(type in FormulaType.unary) {
    if(second !== undefined) {
      console.warn("Dismissing second argument ${second} for unary formula ${strRep}");
    }
    this.inner = first;
  } else if(type in FormulaType.atomic) {
    if(second !== undefined) {
      console.warn("Dismissing second argument ${second} for atomic formula");
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

const FOParser = peg.generate(foGrammar);
const PropositionalParser = peg.generate(propositionalGrammar);

function drawSyntaxTree(formula) {
}
