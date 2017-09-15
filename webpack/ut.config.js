const merge = require('webpack-merge');
const base = require('./base.config.js');
const {solve} = require('../utils/path');

module.exports = merge(base, {
    cache: true,

    entry: {
        unit_test: solve('./client/test/index.ts')
    }
});
