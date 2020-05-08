// required for path resolution for dist folder
const path = require('path');
// used to access the BannerPlugin
const webpack = require('webpack');
// required for pretty format for the Userscript banner
const stripIndent = require('common-tags').stripIndent

const BANNER = stripIndent `
    // ==UserScript==
    // @name         YT Sync
    // @namespace    https://tandashi.de
    // @version      1.4.1
    // @description  Sync Youtube Videos directly on Youtube :)
    // @author       Tandashi
    // @match        https://www.youtube.com/*
    //
    // @icon         http://www.genyoutube.net/helper/favicon.png
    // @icon64       http://www.genyoutube.net/helper/favicon.png
    // @homepage     https://tandashi.de/
    // @downloadURL  https://github.com/Tandashi/YTSync-Plugin/releases/latest/download/lib.user.js
    // @updateURL    https://github.com/Tandashi/YTSync-Plugin/releases/latest/download/lib.user.js
    //
    // @run-at       document-end
    //
    // @require http://code.jquery.com/jquery-3.4.1.min.js
    // @require https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js
    //
    // ==/UserScript==
`

module.exports = {
    banner: BANNER,
    webpack: {
        entry: "./src/plugin.ts",
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }]
        },
        resolve: {
            extensions: [".ts", ".js"]
        },
        output: {
            path: path.resolve(__dirname, "build"),
            filename: "lib.user.js"
        },
        plugins: [
            new webpack.BannerPlugin({
                raw: true,
                banner: BANNER
            })
        ]
    }
};