const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./base.config.js');
const resolve = require('./resolve');
const {solve} = require('../utils/path');

module.exports = merge(base, {
    cache: true,

    entry: {
        'polyfill.iife': solve('./client/polyfill.iife')
    },

    plugins: [
        new webpack.DllReferencePlugin({
            context: __dirname,
		    manifest: require('./depends.hash.json'),
	    })
    ]
});

console.info('~ dev building...');
