const path = require('path');
const webpack = require('webpack');
const resolve = require('./resolve');
const {solve} = require('../utils/path');
const {statics} = require('../manifest.dsl');

// = depend lib/framworks ========
const dll = [
    'react',
    'react-dom',
];

module.exports = {
    entry: {dll},
    
    output: {
        path: solve(statics),
		filename: "[name].js",
		library: "[name]"
    },

    resolve,
    
    plugins: [
        new webpack.DllPlugin({
            path: path.resolve(__dirname, 'depends.hash.json'),
            name: '[name]',
            context: __dirname
        })
    ]
}