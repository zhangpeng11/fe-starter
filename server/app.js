const Koa = require('koa');
const entries = require('./entries');
const perform = require('./perform');
const static = require('./static');

module.exports = new Koa()
.use(perform)
.use(entries)
.use(static)
;