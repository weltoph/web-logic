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
