const path = require('path')
const webpack = require('webpack')
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
// let HtmlWebpackPlugin = require('html-webpack-plugin')
const env = require('yargs').argv.env
let outputFile

let plugins = []

const libraryName = 'jest-gl'
if(env === 'build') {
  plugins.push(new UglifyJsPlugin({minimize: true}))
  outputFile = libraryName + 'min.js'
} else {
  outputFile = libraryName + '.js'
}

module.exports = {
  entry: [
    path.join(__dirname, '/src/jest-gl.js')
  ],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: outputFile,
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: [/node_modules/, /lib/],
      },
    ],
	},
	plugins: plugins,
	target: 'node',
}