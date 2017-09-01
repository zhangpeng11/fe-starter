const Router = require('koa-router');
const router = new Router();
const {getEntries, content} = require('../../utils/fs');
const {solve} = require('../../utils/path');
const {entries, statics, dll} = require('../../manifest.dsl');
const alias = require('./alias.dsl');
const TPL = {};

getEntries(solve(entries)).forEach(entry => {
    const route = `/${entry}`;
    const aliased = alias[route];

    aliased &&
    router.get(aliased, output);
    router.get(route, output);

    TPL[entry] = makeHtmlTpl({entry, statics});

    async function output(ctx, next) {
        await next();

        if (!TPL[entry]) {
            throw new Error(`must get tpl but got: ${TPL[entry]}`)
        }

        ctx.body = TPL[entry];
    }
});

function makeHtmlTpl(options = {}) {
    const {entry, statics, title = '', inline} = options;
    const staticsDir = solve(statics);
    const libfile = `${dll}.js`;
    const businessfile = `${entry}.js`;
    const polyfill = 'polyfill.iife.js';

    let injectedLib = '';
    let injectedBusiness = '';
    let injectedStyle = '';
    let injectedIIFE = '';

    if (inline) {
        const lib = content(solve(staticsDir, libfile));
        const business = content(solve(staticsDir, businessfile));
        const iife = content(solve(staticsDir, polyfill));

        injectedLib = `<script>${lib}</script>`;
        injectedBusiness = `<script>${business}</script>`;
        injectedIIFE = `<script>${iife}</script>`;
    } else {
        injectedLib = `<script src="/${statics}/${libfile}"></script>`;
        injectedBusiness = `<script src="/${statics}/${businessfile}"></script>`;
        injectedIIFE = `<script src="/${statics}/${polyfill}"></script>`;
    }

    return `<!DOCTYPE html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>${title}</title>
            ${injectedLib}
            ${injectedIIFE}
        </head>
        <body>
            <div id="root"></div>
            <div id="root2"></div>
            ${injectedBusiness}
        </body>
    </html>`
}

function makeScript(content) {

}

module.exports = router.routes();
