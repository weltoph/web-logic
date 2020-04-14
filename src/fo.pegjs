formula = ws inner:biimplication ws { return inner; }
biimplication = f:implication ws "<=>" ws s:biimplication { return new logic.logic.Formula(logic.logic.FormulaType.BIIMPLICATION, f, s); }
              / bottom:implication { return bottom; }
implication = f:disjunction ws "=>" ws s:implication { return new logic.logic.Formula(logic.logic.FormulaType.IMPLICATION, f, s); }
            / bottom:disjunction { return bottom; }
disjunction = f:conjunction ws "|" ws s:disjunction { return new logic.logic.Formula(logic.FormulaType.DISJUNCTION, f, s); }
            / bottom:conjunction { return bottom; }
conjunction = f:negation ws "&" ws s:conjunction { return new logic.Formula(logic.FormulaType.CONJUNCTION, f, s); }
            / bottom:negation { return bottom; }
negation = "~" ws inner:negation { return new logic.Formula(logic.FormulaType.NEGATION, inner); }
            / bottom:atom { return bottom; }

variable = ws name:[a-zA-Z]+ ws { return new logic.Formula(logic.FormulaType.ATOM, name.toString()); }
variableList = ws f:variable ws "," ws r:variableList{ return [f].concat(r); }
             / ws l:variable ws { return [l] };

ws = [" "]*

atom = alone:predicate { return alone; }
     / alone:quantification { return alone; }
     / "(" ws alone:formula ws ")" { return alone; }

predicate = name:[a-zA-Z]+ "(" ws variableList:variableList ws ")" { return new logic.Formula(logic.FormulaType.ATOM, name, variableList); }
quantification = "!" ws "[" ws variableList:variableList ws "]" ws ":" inner:negation {
                    var f = null;
                    for(const quantifiedVariable of variableList.reverse()) {
                      if(f === null) {
                        f = new logic.Formula(logic.FormulaType.UNIVERSAL, quantifiedVariable, inner);
                      } else {
                        f = new logic.Formula(logic.FormulaType.UNIVERSAL, quantifiedVariable, f);
                      }
                    }
                    console.log(f);
                    console.log(f.quantifiedVariable);
                    console.log(f.innerFormula);
                    return f;
                  }
               / "?" ws "[" ws variableList:variableList ws "]" ws ":" inner:negation {
                    var f = null;
                    for(const quantifiedVariable of variableList.reverse()) {
                      if(f === null) {
                        f = new logic.Formula(logic.FormulaType.EXISTENTIAL, quantifiedVariable, inner);
                      } else {
                        f = new logic.Formula(logic.FormulaType.EXISTENTIAL, quantifiedVariable, f);
                      }
                    }
                    return f;
                  }
