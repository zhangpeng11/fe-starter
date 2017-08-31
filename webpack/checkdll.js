/**
 * check if build dll
 * if package.json changed
 * rebuild
 */

const assert = require('assert');
const {exec} = require('child_process');
const {solve} = require('../utils/path');
const PHJ = 'webpack/package.hash.json';

// = main ==================================
if (hasChanged()) {
    build();
}
// = main ==================================

function hasChanged() {
    const last = read(solve(PHJ));
    
    // first time no package.hash.json
    if (!last) {
        change(); return;
    }

    const curr = read(solve('package.json'));

    try {
        assert.deepEqual(last, curr);
    } catch(e) {
        change(); return;
    }

    console.log('~ dll nothing changed');
}

function change() {
    build();
    updateLast();
}

function build() {
    console.log('~ building...');
    exec('npm run dll',  printio);
}

function read(filename) {
    try {
        return require(filename);
    } catch(e) {
        return null;
    }
}

function updateLast() {
    exec(`cp package.json ${PHJ}`, printio);
}

function printio(error, stdout, stderr) {
    error  && console.error(error);
    stdout && console.log(stdout);
    stderr && console.log(stderr);
}

