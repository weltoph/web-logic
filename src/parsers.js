const plParser = require("./pl.pegjs");
const foParser = require("./fo.pegjs");

const ParseResult = {
  SUCCESS: 0,
  FAILURE: 1
};

function parsePlFormula(text) {
  var formula = null;
  var result = {};
  try {
    formula = plParser.parse(text);
    result.type = ParseResult.SUCCESS;
    result.formula = formula;
    return result;
  } catch(e) {
    result.type = ParseResult.FAILURE;
    result.message = e.message;
    result.location = e.location;
    return result;
  }
}

function parseFoFormula(text) {
  var formula = null;
  var result = {};
  try {
    formula = foParser.parse(text);
    result.type = ParseResult.SUCCESS;
    result.formula = formula;
    return result;
  } catch(e) {
    result.type = ParseResult.FAILURE;
    result.message = e.message;
    result.location = e.location;
    return result;
  }
}

module.exports = {
  parsePlFormula: parsePlFormula,
  parseFoFormula: parseFoFormula,
  ParseResult: ParseResult
};
