const path = require('path');

module.exports = [
  {
    entry: './src/truthtable.js',
    mode: "development",
    output: {
      filename: 'truthtable.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }, {
    entry: './src/syntaxtree.js',
    mode: "development",
    output: {
      filename: 'syntaxtree.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }, {
    entry: './src/fo-graph.js',
    mode: "development",
    output: {
      filename: 'fo-graph.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
];
