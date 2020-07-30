const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(baseConfig.webpack, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            preamble: baseConfig.banner
          },
        },
        extractComments: true,
      })
    ]
  }
});