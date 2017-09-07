const http = require('http');
const port = 3000;
const prefix = '~';

// = starter ===============================
if (process.env.NODE_ENV == 'development') {
    http.createServer(dev).listen(3000, printTarget);
} else {
    require('./app').listen(3000, printTarget);
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
