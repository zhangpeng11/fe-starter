const http = require('http');
const port = process.env.port = getPort();
const prefix = '~';

// = starter ===============================
if (process.env.NODE_ENV == 'development') {
    http.createServer(dev).listen(port, printTarget);
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

function clearCache() {
    Object.keys(require.cache).forEach((module) => {
        if (!module.match(/node_modules/)) {
            delete require.cache[module];
        }
    });
}

function getPort() {
    return process.env.UNIT_TEST == 'on' ? 8192 : 3000;
}
