const merge = require('webpack-merge');
const base = require('./base.config.js');
const {solve} = require('../utils/path');
const {ut} = require('../utils/manifest.dsl');

module.exports = merge(base, {
    cache: true,

    entry: {
        [ut]: solve('./client/test/index.ts')
    }
});
