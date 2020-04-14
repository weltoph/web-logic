const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

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
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/truthtable.html',
        filename: './deployable/truthtable.html',
        inlineSource: '.(js|css)$'
      }),
      new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
    ]
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
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/syntaxtree.html',
        filename: './deployable/syntaxtree.html',
        inlineSource: '.(js|css)$'
      }),
      new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
    ]
  },
];
