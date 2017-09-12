const {solve} = require('./path');
const fs = require('fs');

/**
 * given a directory, for it's every child
 * if child is a directory
 * and child/index.tsx? is a file
 * it's treated as a `entry`
 */
exports.getEntries = function(dir) {
    const children = fs.readdirSync(dir);
    const entries = [];

    children.forEach(name => {
        const entry = solve(dir, name);
        const tsx = solve(dir, `${name}/index.tsx`);
        
        if (isDir(entry) && isFile(tsx)) {
            entries.push(name);
        }
    });

    return entries;
};

exports.isDir = isDir;
exports.isFile = isFile;
exports.content = content;

function isDir(filename) {
    try {
        return fs.statSync(filename).isDirectory();
    } catch(e) {
        return false;
    }
}

function isFile(filename) {
    try {
        return fs.statSync(filename).isFile();
    } catch(e) {
        return false;
    }
}

function content(filename) {
    try {
        return fs.readFileSync(filename, 'utf-8');
    } catch(e) {
        return null;
    }
}