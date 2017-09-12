const path = require('path');
const { isString } = require('./type');
const rootdir = path.resolve(__dirname, '..');

exports.rootdir = rootdir;

exports.solve = function(root, dir) {
    if (!dir) {
        dir = root;
        root = rootdir;
    }
    
    if (!isString(root)) throw new Error(`root must be string type got ${root}`);
    if (!isString(dir)) throw new Error(`dir must be string type got ${dir}`);

    return path.join(root, dir);
};