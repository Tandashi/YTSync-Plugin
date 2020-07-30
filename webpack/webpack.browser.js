const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = merge(baseConfig.webpack, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: true
      })
    ]
  },
  plugins: [
    new CopyPlugin([{
      from: 'browser',
      to: '.',
    }]),
    new ZipPlugin()
  ]
});