const {testapi, statics, ut} = require('../utils/shared');
const {exec} = require('child_process');
const {rm, generateEntry} = require('../utils/fs');
const {solve} = require('../utils/path');
const testPath = '/__test160930__';
const url = `http://localhost:${process.env.port}${testPath}`;
const testdir = solve('./client/test');
const entryfile = solve('./client/test/index.ts');
const watchMode = process.env.NODE_ENV == 'development';

initUnitTestEnv().catch(e => console.error(e));

module.exports = async function(ctx, next) {
    await next();

    if (ctx.path == testPath) {
        console.info('UNIT_TEST::', url);
        ctx.body = makeHtmlTpl();
        return;
    }

    if (ctx.path == testapi) {
        ctx.body = 'ok';

        if (!watchMode) {
            const results = ctx.request.body.results;
            setTimeout(() => {
                endUnitTest(results);
            }, 0);
        }

        return;
    }
};

async function initUnitTestEnv() {
    rm(entryfile);

    generateEntry(testdir, entryfile);
    try {
        await buildClientCode();
        await openBrowser();
    } catch(e) {
        throw e;
    }
}

/**
 * ! WORK ONLY IN MAC
 * https://stackoverflow.com/questions/8085474/can-node-js-invoke-chrome
 */
function openBrowser() {
    return new Promise((r, j) => {
        exec(`open -ga "Google Chrome" ${url}`, (err, stdout, stderr) => {
            stdout && console.info(`~ open browser stdout:\n ${stdout}`);
            stderr && console.error(`~ open browser stderr:\n ${stderr}`);

            err ? j(err) : r();
        });
    });
}

function buildClientCode() {
    return new Promise((r, j) => {
        const args = watchMode ? '-- -w' : '';
        const process = exec(`npm run build:ut ${args}`, (err, stdout, stderr) => {
            stdout && console.info(`~ build client code stdout:\n ${stdout}`);
            stderr && console.error(`~ build client code stderr:\n ${stderr}`);

            err ? j(err) : r();
        });




        if (watchMode) {
            process.stdout.on('data', data => console.info(data));
            process.stderr.on('data', data => console.error(data));

            /**
             * if in watch mode slove after 5ooms
             * cause process is in running
             * so we cant cannot solve in end callback
             */
            setTimeout(r, 500);
        }
    });
}

function endUnitTest({errors, description} = {}) {
    rm(entryfile);

    if (Array.isArray(errors) && errors.length) {
        console.error(description);
        console.info('See more information try `npm run test:watch`');
        process.exit(1);
    } else {
        console.info('\n~client unit test');
        console.info(description);
        process.exit(0);
    }
}

function makeHtmlTpl() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8"/>
        <title>unit test</title>
    </head>
    <body>
      <div id="tips"></div>
      <div id="root"></div>
      <script src="./${statics}/${ut}.js"></script>
      <script> console.info('${url}') </script>
    </body>
  </html>`;
}

// function randomString() {
//     return Math.random().toString(16).replace('.', 'ut');
// }
