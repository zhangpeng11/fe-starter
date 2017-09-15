#!/usr/bin/env node

const {generateEntry, rm} = require('../utils/fs');
const {solve} = require('../utils/path');
const {join} = require('path');
const {exec} = require('child_process');
const dir = solve('test');
const file = solve(join('test', 'index.js'));

runNodejsTest();

function runNodejsTest() {
  generateEntry(dir, file, 'node');
  exec(`node ${file}`, (err, stdout, stderr) => {
    const prefix = '\n~ nodejs unit test';
    stdout && console.info(`${prefix} stdout:\n${stdout}`);
    stderr && console.error(`${prefix} stderr:\n${stderr}`);

    rm(file);

    if (err) throw err;
  });
}

