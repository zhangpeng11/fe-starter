const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./base.config.js');
const {solve, rootdir} = require('../utils/path');
const {statics} = require('../utils/manifest.dsl');
const depends = getDepends();
const plugins = [];

if (depends) {
    plugins.push(new webpack.DllReferencePlugin({
        context: rootdir,
        manifest: depends,
    }));
}

module.exports = merge(base, {
    cache: true,

    entry: {
        app: solve('./client/main.ts')
    },

    plugins,
});

function getDepends() {
    // consider do belows
    // firendly tips tell user should re-build dll
    // 1. package.json changed
    // 2. dll.config.js changed
    // 3. statics/dll.js not built
    try {
        return require(`../${statics}/depends.hash.json`);
    } catch(e) {
        const warning = 'WARNING: you may don\'t build dll, try run "npm run dll".\n';
        console.warn('\x1b[31m%s\x1b[0m', warning);
        return null;
    }
}

console.info('~ dev building...');
