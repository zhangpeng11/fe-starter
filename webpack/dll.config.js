const path = require('path');
const webpack = require('webpack');
const {solve, rootdir} = require('../utils/path');
const {statics} = require('../utils/manifest.dsl');

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

    plugins: [
        new webpack.DllPlugin({
            path: path.resolve(rootdir, `${statics}/depends.hash.json`),
            name: '[name]',
            context: rootdir
        })
    ]
}
