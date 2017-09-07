const path = require('path');
const fix = '@';

module.exports = function(content) {
  let js = {};

  try {
    js = eval(content)
  } catch(e) {
    // todo
    // route format schema check
    console.warn(`WARNING: content must be javascript`);
  }

  Object.keys(js).forEach(pathname => {
    const opts = js[pathname];

    if (typeof opts == 'string') {
      js[pathname] = makeAsyncImportTpl(path.basename(opts), opts);
    } else if (typeof opts.page == 'string') {
      opts.page = makeAsyncImportTpl(path.basename(opts.page), opts.page);
    } else {
      console.warn(`should have page information in every path`);
    }
  })

  return replaceAll(`module.exports = ${toString(js)}`);
}

function replaceAll(string) {
  return string
    .replace(new RegExp(`"${fix}`, 'g'), '')
    .replace(new RegExp(`${fix}"`, 'g'), '');
}

function makeAsyncImportTpl(chunk, package) {
  return `${fix}() => import(/* webpackChunkName: '${chunk}' */'${package}')${fix}`;
}

function toString(obj) {
  return JSON.stringify(obj, (key, val) => {
    if (typeof val === 'function') {
      return `${fix}${val}${fix}`;
    }
    return val;
  });
}
