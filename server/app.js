const Koa = require('koa');
const entries = require('./entries');
const perform = require('./perform');
const static = require('./static');
const app = module.exports = new Koa();

app.use(perform);
app.use(entries);
app.use(static);