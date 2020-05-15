const peg = require("pegjs");
const logic = require("./logic");

const propositionalGrammar = `
{
  const logic = options.logicReference;
}
formula = ws inner:biimplication ws { return inner; }
biimplication = f:implication ws "<=>" ws s:biimplication { return new logic.BiImplication(f, s); }
              / bottom:implication { return bottom; }
implication = f:disjunction ws "=>" ws s:implication { return new logic.Implication(f, s); }
            / bottom:disjunction { return bottom; }
disjunction = f:conjunction ws "|" ws s:disjunction { return new logic.Disjunction(f, s); }
            / bottom:conjunction { return bottom; }
conjunction = f:negation ws "&" ws s:conjunction { return new logic.Conjunction(f, s); }
            / bottom:negation { return bottom; }
negation = "~" ws inner:negation { return new logic.Negation(inner); }
            / bottom:atom { return bottom; }

variable = ws name:[a-zA-Z]+ ws {  return new logic.Proposition(name.join("")); }

ws = [" "]*


atom = variable:variable { return variable; }
     / "(" ws alone:formula ws ")" { return alone; }
`;

const firstOrderGrammar = `
{
  const logic = options.logicReference;
}
formula = ws inner:biimplication ws { return inner; }
biimplication = f:implication ws "<=>" ws s:biimplication { return new logic.BiImplication(f, s); }
              / bottom:implication { return bottom; }
implication = f:disjunction ws "=>" ws s:implication { return new logic.Implication(f, s); }
            / bottom:disjunction { return bottom; }
disjunction = f:conjunction ws "|" ws s:disjunction { return new logic.Disjunction(f, s); }
            / bottom:conjunction { return bottom; }
conjunction = f:negation ws "&" ws s:conjunction { return new logic.Conjunction(f, s); }
            / bottom:negation { return bottom; }
negation = "~" ws inner:negation { return new logic.Negation(inner); }
            / bottom:atom { return bottom; }

variable = ws name:[a-zA-Z]+ ws { return new logic.Variable(name.join("")); }
variableList = ws f:variable ws "," ws r:variableList{ return [f].concat(r); }
             / ws l:variable ws { return [l] };

ws = [" "]*

atom = alone:predicate { return alone; }
     / alone:quantification { return alone; }
     / "(" ws alone:formula ws ")" { return alone; }

predicate = name:[a-zA-Z]+ "(" ws variableList:variableList ws ")" { return new logic.predicate(name.join(""), variableList); }
          / f:variable ws "=" ws s:variable { return new logic.Equality(f, s); }
quantification = "!" ws quantifiedVariable:variable ws "." ws inner:negation { return new logic.Universal(quantifiedVariable, inner); }
               / "?" ws quantifiedVariable:variable ws "." ws inner:negation { return new logic.Existential(quantifiedVariable, inner); }
`;

const propositionalParser = peg.generate(propositionalGrammar);
const firstOrderParser = peg.generate(firstOrderGrammar);

module.exports = {
  parsePropositional: text => propositionalParser.parse(text, { "logicReference": logic }),
  parseFirstOrder: text => firstOrderParser.parse(text, { "logicReference": logic })
};
