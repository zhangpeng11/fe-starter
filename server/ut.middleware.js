const {testapi, statics, ut} = require('../utils/manifest.dsl');
const {exec} = require('child_process');
const {walk, rm} = require('../utils/fs');
const {writeFileSync, } = require('fs');
const {solve} = require('../utils/path');
const testPath = `/${randomString()}`;
const port = process.env.port;
const url = `http://localhost:${port}${testPath}`;
const testdir = solve('./client/test');
const entryfile = solve('./client/test/index.ts');

initUnitTestEnv();

module.exports = async function(ctx, next) {
    await next();

    if (ctx.path == testPath) {
        ctx.body = makeHtmlTpl();
        return;
    }

    if (ctx.path == testapi) {
        ctx.body = 'ok';
        setTimeout(() => endUnitTest(ctx.request.body.results), 0);
        return;
    }
};

async function initUnitTestEnv() {
    generateTestEntry(testdir, entryfile);
    await buildClientCode();
    await openBrowser();
}

/**
 * ! WORK ONLY IN MAC
 * https://stackoverflow.com/questions/8085474/can-node-js-invoke-chrome
 */
function openBrowser() {
    return new Promise((r, j) => {
        exec(`open -a "Google Chrome" ${url}`, (err, stdout, stderr) => {
            stdout && console.info(`stdout: ${stdout}`);
            stderr && console.error(`stderr: ${stderr}`);

            err ? j(err) : r();
        });
    });
}

function buildClientCode() {
    return new Promise((r, j) => {
        exec('npm run build:ut', (err, stdout, stderr) => {
            stdout && console.info(`stdout: ${stdout}`);
            stderr && console.error(`stderr: ${stderr}`);

            err ? j(err) : r();
        });
    });
}

function endUnitTest({errors, description} = {}) {
    rm(entryfile);

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
      <script src="./${statics}/${ut}.js"></script>
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
function generateTestEntry(dir, file) {
    let files = walk(dir);
    let ret = [];

    files.forEach(file => {
        let fileStr = file[0] == '/'
            ? file
            : './' + file;
        ret.push(`import '${fileStr}';\n`);
    });

    const str = ret.join('');

    return file
        ? writeFileSync(file, str, 'utf-8')
        : str;
}
