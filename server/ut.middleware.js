const {testapi, statics} = require('../utils/manifest.dsl');
const {exec} = require('child_process');
const testPath = `/${randomString()}`;
const port = process.env.port;
const url = `http://localhost:${port}${testPath}`;

initUnitTestEnv();

module.exports = async function(ctx, next) {
    await next();

    if (ctx.path == testPath) {
        ctx.body = makeHtmlTpl();
    }

    if (ctx.path == testapi) {
        ctx.body = 'ok';
        setTimeout(() => {
            endUnitTest(ctx.request.body.results);
        }, 0);
    }
};

function initUnitTestEnv() {
    generateTestEntry();
    buildClientCode(openBrowser);
}

/**
 * ! WORK ONLY IN MAC
 * https://stackoverflow.com/questions/8085474/can-node-js-invoke-chrome
 */
function openBrowser() {
    exec(`open -a "Google Chrome" ${url}`, (err, stdout, stderr) => {
        stdout && console.info(`stdout: ${stdout}`);
        stderr && console.error(`stderr: ${stderr}`);

        if (err) throw err;
    });
}

function buildClientCode(afterExecDone) {
    exec('npm run build:ut', (err, stdout, stderr) => {
        stdout && console.info(`stdout: ${stdout}`);
        stderr && console.error(`stderr: ${stderr}`);

        if (err) throw err;
        if (typeof afterExecDone == 'function') {
            afterExecDone();
        }
    });
}

function endUnitTest({errors, description} = {}) {
    if (Array.isArray(errors) && errors.length) {
        console.error(description);
        console.info(`See more information in ${url}`);
        process.exit(1);
    } else {
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
      <h1>
        Unit Test Page,
        Please check devtool's console,
        for more information
      </h1>
      <div id="root"></div>
      <script src="./${statics}/unit_test.js"></script>
    </body>
  </html>`;
}

function randomString() {
    return Math.random().toString(16).replace('.', 'ut');
}

/**
 * generate unit test entry file
 * like this
 * ```
 * import './history.spec.ts';
 * import './entries/home.sepc.ts';
 * ```
 * walk the test dir &
 * got the files name
 * piece them together
 */
function generateTestEntry() {

}
