const {solve} = require('./path');
const fs = require('fs');
const path = require('path');

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
exports.walk = walk;
exports.rm = rm;
exports.generateEntry = generateEntry;

/** TODO also need support rm dir safely */
function rm(filename, safe) {
    try {
        fs.unlinkSync(filename);
    } catch(e) {
        return safe ? e : undefined;
    }
}

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

function walk(dir, iterator) {
    if (!isDir(dir)) throw Error(`${dir} is not directory`);
    if (typeof iterator != 'function') return _walk2(dir, []);

    const children = fs.readdirSync(dir);

    children.forEach(child => {
        const subname = path.join(dir, child);
        if (isDir(subname)) {
            walk(subname);
        } else {
            iterator(subname);
        }
    });
}

/** return array of files in dir deeply */
function _walk2(dir, ret) {
    const children = fs.readdirSync(dir);

    children.forEach(child => {
        const subname = path.join(dir, child);
        if (isDir(subname)) {
            ret.concat(_walk2(subname, ret));
        } else {
            ret.push(subname);
        }
    });

    return ret;
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
function generateEntry(dir, file, env) {
    if (!(file && typeof file == 'string')) {
        throw new Error(`must pass file argument got: ${file}`);
    }

    let files = walk(dir);
    let ret = [];

    files.forEach(file => {
        let loader = env == 'node' ? 'require' : 'import ';
        let fileStr = file[0] == '/' ? file : './' + file;

        ret.push(`${loader}('${fileStr}');\n`);
    });

    const str = ret.join('');

    try {
        return fs.writeFileSync(file, str, 'utf-8');
    } catch(e) {
        return e;
    }
}
