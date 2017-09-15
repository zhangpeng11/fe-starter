const Router = require('koa-router');
const router = new Router();
const {getEntries, content} = require('../../utils/fs');
const {solve} = require('../../utils/path');
const {entries, statics, dll} = require('../../utils/shared');
const routes = require('../../utils/routes.dsl');
const TPL = {};

getEntries(solve(entries)).forEach(entry => {
    const pathname = `/${entry}`;
    const route = routes[pathname];

    router.get(pathname, output);

    /** support alias feature */
    if (route && route.alias) {
        router.get(route.alias, output);
    }

    TPL[entry] = makeHtmlTpl({entry, statics});

    async function output(ctx, next) {
        await next();

        if (!TPL[entry]) {
            throw new Error(`must get tpl but got: ${TPL[entry]}`);
        }

        ctx.body = TPL[entry];
    }
});

function makeHtmlTpl(options = {}) {
    const {entry, statics, title = '', inline} = options;
    const staticsDir = solve(statics);
    const libfile = `${dll}.js`;
    const businessfile = `${entry}.js`;
    const appFile = 'app.js';

    let injectedLib = '';
    let injectedBusiness = '';
    // let injectedStyle = '';
    let injectedApp = '';

    if (inline) {
        const lib = content(solve(staticsDir, libfile));
        const business = content(solve(staticsDir, businessfile));
        const app = content(solve(staticsDir, appFile));

        injectedLib = `<script>${lib}</script>`;
        injectedBusiness = `<script>${business}</script>`;
        injectedApp = `<script>${app}</script>`;
    } else {
        injectedLib = `<script src="/${statics}/${libfile}"></script>`;
        // injectedBusiness = `<script src="/${statics}/${businessfile}"></script>`;
        injectedApp = `<script src="/${statics}/${appFile}"></script>`;
    }

    return `<!DOCTYPE html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>${title}</title>
            ${injectedLib}
            ${injectedApp}
        </head>
        <body>
            <div id="root"></div>
            <div id="root2"></div>
            ${injectedBusiness}
        </body>
    </html>`;
}

module.exports = router.routes();
