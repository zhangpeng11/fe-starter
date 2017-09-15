const Koa = require('koa');
const entries = require('./entries');
const perform = require('./perform');
const static = require('./static');
const bodyParser = require('koa-bodyparser');
const app = module.exports = new Koa();

app.use(bodyParser());
app.use(perform);
app.use(entries);
app.use(static);

/**
 * unit test mode
 * design for bussness
 */
if (process.env.UNIT_TEST == 'on') {
    app.use(require('./ut.middleware'));
}
