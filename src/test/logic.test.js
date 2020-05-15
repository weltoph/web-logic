const logic = require("../logic");
const parser = require("../parser");

/* (X | Y) & X */
const propositionalFormula1 = new logic.Conjunction(
  new logic.Disjunction(
    new logic.Proposition("X"),
    new logic.Proposition("Y")),
  new logic.Proposition("X"));

const X = new logic.Proposition("X");
const Y = new logic.Proposition("Y");

const valuationX0Y0 = new logic.PropositionValuation([]);
const valuationX0Y1 = new logic.PropositionValuation([Y]);
const valuationX1Y0 = new logic.PropositionValuation([X]);
const valuationX1Y1 = new logic.PropositionValuation([X, Y]);

/* ~(X & Y) */
const propositionalFormula2 = new logic.Negation(new logic.Conjunction(X, Y));

/* ? b . ( Blue(b) & ! o. ~o=b => E(b, o) ) */
const firstOrderFormula1 = new logic.Existential(
  new logic.Variable("b"),
  new logic.Conjunction(
    new logic.Predicate("Blue", [new logic.Variable("b")]),
    new logic.Universal(
      new logic.Variable("o"),
      new logic.Implication(
        new logic.Negation(
          new logic.Equality(
            new logic.Variable("o"),
            new logic.Variable("b"))),
        new logic.Predicate("E", [new logic.Variable("b"),
                                  new logic.Variable("o")])))));

const b = new logic.Variable("b");
const o = new logic.Variable("o");
const blueB = new logic.Predicate("Blue", [b]);
const Ebo = new logic.Predicate("E", [b, o]);
const oIsb = new logic.Equality(o, b);

test("X and Y are different", () => {
  expect(X.isEqualTo(Y)).toBeFalsy();
  expect(Y.isEqualTo(X)).toBeFalsy();
});

test("X = X and Y = Y", () => {
  expect(X.isEqualTo(new logic.Proposition("X"))).toBeTruthy();
  expect(Y.isEqualTo(new logic.Proposition("Y"))).toBeTruthy();
  expect(new logic.Proposition("X").isEqualTo(X)).toBeTruthy();
  expect(new logic.Proposition("Y").isEqualTo(Y)).toBeTruthy();
});

test("formula equality", () => {
  expect(propositionalFormula1.isEqualTo(propositionalFormula1)).toBeTruthy();
  expect(propositionalFormula2.isEqualTo(propositionalFormula2)).toBeTruthy();
  expect(propositionalFormula1.isEqualTo(propositionalFormula2)).toBeFalsy();
  expect(propositionalFormula2.isEqualTo(propositionalFormula1)).toBeFalsy();
  expect(firstOrderFormula1.isEqualTo(firstOrderFormula1)).toBeTruthy();
  expect(firstOrderFormula1.isEqualTo(propositionalFormula1)).toBeFalsy();
  expect(firstOrderFormula1.isEqualTo(propositionalFormula2)).toBeFalsy();
});

test("requires brackets left", () => {
  expect(propositionalFormula1.requiresBracketsLeft()).toBeTruthy();
});

test("not requires brackets right", () => {
  expect(propositionalFormula1.requiresBracketsRight()).toBeFalsy();
});

test("requires brackets inner", () => {
  expect(propositionalFormula2.requiresBracketsInner()).toBeTruthy();
});

test("not requires brackets inner", () => {
  expect(new logic.Negation(X).requiresBracketsInner()).toBeFalsy();
});

test("propositional atoms extraction", () => {
  const atoms1 = propositionalFormula1.getAtoms();
  const atoms2 = propositionalFormula2.getAtoms();
  const expectedAtoms = [X, Y];
  expect(atoms1.length).toBe(expectedAtoms.length);
  expect(atoms2.length).toBe(expectedAtoms.length);
  for(var i = 0; i < atoms1.length; i++) {
    expect(atoms1[i].isEqualTo(expectedAtoms[i])).toBeTruthy();
    expect(atoms2[i].isEqualTo(expectedAtoms[i])).toBeTruthy();
  }
});

test("first-order atoms extraction", () => {
  const atoms1 = firstOrderFormula1.getAtoms();
  const expectedAtoms = [blueB, oIsb, Ebo];
  expect(atoms1.length).toBe(expectedAtoms.length);
  for(var i = 0; i < atoms1.length; i++) {
    expect(atoms1[i].isEqualTo(expectedAtoms[i])).toBeTruthy();
  }
});

test("interpretation of propositional formulae", () => {
  expect(propositionalFormula1.evaluate(valuationX0Y0)).toBeFalsy();
  expect(propositionalFormula1.evaluate(valuationX0Y1)).toBeFalsy();
  expect(propositionalFormula1.evaluate(valuationX1Y0)).toBeTruthy();
  expect(propositionalFormula1.evaluate(valuationX1Y1)).toBeTruthy();
  expect(propositionalFormula2.evaluate(valuationX0Y0)).toBeTruthy();
  expect(propositionalFormula2.evaluate(valuationX0Y1)).toBeTruthy();
  expect(propositionalFormula2.evaluate(valuationX1Y0)).toBeTruthy();
  expect(propositionalFormula2.evaluate(valuationX1Y1)).toBeFalsy();
});

test("parsing propositional formulae", () => {
  const parsedFormula1 = parser.parsePropositional("(X | Y) & X");
  const parsedFormula2 = parser.parsePropositional("~(X&Y)");
  expect(propositionalFormula1.isEqualTo(parsedFormula1)).toBeTruthy();
  expect(propositionalFormula2.isEqualTo(parsedFormula2)).toBeTruthy();
  expect(parsedFormula1.isEqualTo(propositionalFormula1)).toBeTruthy();
  expect(parsedFormula2.isEqualTo(propositionalFormula2)).toBeTruthy();
});
