const path = require('path');

module.exports = {
  entry: {
    truthtable: './src/truthtable.js',
    syntaxtree: './src/syntaxtree.js',
    normalform: './src/normalform.js'
  },
  mode: "development",
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { test: /\.pegjs$/, use: 'pegjs-loader?dependencies={"logic":"./logic.js"}' }
    ]
  },
};
