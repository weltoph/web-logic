const path = require('path');

module.exports = [
  {
    entry: './src/truthtable.js',
    mode: "production",
    output: {
      filename: 'truthtable.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }, {
    entry: './src/syntaxtree.js',
    mode: "production",
    output: {
      filename: 'syntaxtree.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }, {
    entry: './src/fo-graph.js',
    mode: "production",
    output: {
      filename: 'fo-graph.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
];
