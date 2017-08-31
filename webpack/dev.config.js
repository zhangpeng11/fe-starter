const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./base.config.js');
const resolve = require('./resolve');
const {solve} = require('../utils/path');

module.exports = merge(base, {
    // cache: true,
    
    plugins: [
        new webpack.DllReferencePlugin({
            context: '.',
		    manifest: 'require("./depends.hash.json")',
	    })
    ],
    
    // resolve,
});

console.info('~ dev building...');