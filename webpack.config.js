const path = require('path');

module.exports = [
  {
    entry: './src/truthtable.js',
    mode: "production",
    output: {
      filename: 'truthtable.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        { test: /\.pegjs$/, use: 'pegjs-loader?dependencies={"logic":"./logic.js"}' }
      ]
    },
  }, {
    entry: './src/syntaxtree.js',
    mode: "production",
    output: {
      filename: 'syntaxtree.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        { test: /\.pegjs$/, use: 'pegjs-loader?dependencies={"logic":"./logic.js"}' }
      ]
    },
  }, {
    entry: './src/fo-graph.js',
    mode: "production",
    output: {
      filename: 'fo-graph.bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        { test: /\.pegjs$/, use: 'pegjs-loader?dependencies={"logic":"./logic.js"}' }
      ]
    },
  },
];
