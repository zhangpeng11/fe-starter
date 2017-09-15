const http = require('http');
const port = process.env.port = getPort();
const prefix = '~';

// = starter ===============================
if (process.env.NODE_ENV == 'development') {
    http.createServer(dev).listen(port, printTarget);
    alive();
} else {
    require('./app').listen(port, printTarget);
}

function printEnv() {
    console.info(`${prefix} server in ${process.env.NODE_ENV} mode`);
}

function dev(req, res) {
    clearCache();
    require('./app').callback()(req, res);
}

function printTarget() {
    printEnv();
    console.info(`${prefix} http://localhost:${port}`);
}

/** just for exec at least once */
function alive() {
    require('./app');
}

function clearCache() {
    Object.keys(require.cache).forEach((module) => {
        const whitelist = [/node_modules/, /ut.middleware/];
        const shouldClear = whitelist.every(i => !module.match(i));

        /** remove cache not in white list */
        if (shouldClear) {
            delete require.cache[module];
        }
    });
}

function getPort() {
    return process.env.UNIT_TEST == 'on' ? 8192 : 3000;
}
