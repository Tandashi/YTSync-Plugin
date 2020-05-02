const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

module.exports = merge(baseConfig.webpack, {
    devtool: 'inline-source-map',
    mode: "development",
});