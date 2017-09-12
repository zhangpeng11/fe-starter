const fs = require('fs');
const Router = require('koa-router');
const {solve} = require('../../utils/path');
const {statics} = require('../../utils/manifest.dsl');
const router = new Router();

function static(dir) {
    dir = removeSlash(dir);
    dir = `/${dir}/*`;

    router.get(dir, async function(ctx, next) {
        await next();

        ctx.body = fs.createReadStream(solve(ctx.path));
    });

    return router.routes();
}

function removeSlash(s) {
    if (s[0] == '/') s = s.substr(1);

    const l = s.length;
    if (s[l - 1] == '/') s = s.substr(0, l - 2);

    return s;
}


module.exports = static(statics);
