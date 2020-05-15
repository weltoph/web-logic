const logic = require("../logic");

/* (X | Y) & X */
const propositionalFormula = new logic.Conjunction(
  new logic.Disjunction(
    new logic.Proposition("X"),
    new logic.Proposition("Y")),
  new logic.Proposition("X"));

const X = new logic.Proposition("X");
const Y = new logic.Proposition("Y");

test("X and Y are different", () => {
  expect(X.isEqualTo(Y)).toBeFalsy();
  expect(Y.isEqualTo(X)).toBeFalsy();
});

test("Requires brackets left", () => {
  expect(propositionalFormula.requiresBracketsLeft()).toBeTruthy()
});

test("Not requires brackets right", () => {
  expect(propositionalFormula.requiresBracketsRight()).toBeFalsy()
});

test("atoms are identified correctly", () => {
  const atoms = propositionalFormula.getAtoms();
  const expectedAtoms = [X, Y];
  expect(atoms.length).toBe(expectedAtoms.length);
  for(var i = 0; i < atoms.length; i++) {
    expect(atoms[i].isEqualTo(expectedAtoms[i])).toBeTruthy();
  }
});
