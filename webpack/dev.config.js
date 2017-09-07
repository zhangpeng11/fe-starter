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
        }),
        // dev 环境不用优化
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'webpack.runtime',
        //     names: ['runtime']
        // }),
        // new BundlePlugin()
    ]
});

console.info('~ dev building...');

/** merge files and delete fragment */
// function BundlePlugin() {};

// function bundle(compilation, callback) {
//     const files = ['webpack.runtime.js', 'polyfill.iife.js'];
//     const bundled = files.reduce((content, filename) => {
//         return content += compilation.assets[filename].source();
//     }, '');

//     compilation.assets['bundle.js'] = {
//         source: function () {
//             return bundled;
//         },
//         size: function () { return bundled.length; }
//     }

//     files.forEach(filename => delete compilation.assets[filename])

//     callback();
// }

// BundlePlugin.prototype.apply = function (compiler) {
//     compiler.plugin('emit', bundle);
// };
