const path = require('path');
const vm = require('vm');
const fix = '@';

module.exports = function(content) {
  let js = {};

  try {

    js = evalNodejs(content);

    if (!checkSchema(js)) throw new Error('routes.dsl schema not correct');

  } catch(e) {

    js = {};
    console.warn(`WARNING: `, e);
  }

  Object.keys(js).forEach(pathname => {
    const opts = js[pathname];

    if (typeof opts == 'string') {
      js[pathname] = makeAsyncImportTpl(path.basename(opts), opts);
    } else if (typeof opts.page == 'string') {
      opts.page = makeAsyncImportTpl(path.basename(opts.page), opts.page);
    } else {
      console.warn(`WARNING: should define page information got => `, opts);
    }
  })

  return repalceChars(`module.exports = ${toString(js)}`);
}

function evalNodejs(src) {
  const $m = {exports: {}};
  const $e = $m.exports;
  const code = require('module').wrap(src);

  vm.runInThisContext(code)($e, require, $m);

  return $m.exports;
}

function checkSchema(any) {
  if (!any) return false;
  if (typeof any != 'object') return false;

  return true;
}

function repalceChars(string) {
  return string
    .replace(new RegExp(`"${fix}`, 'g'), '')
    .replace(new RegExp(`${fix}"`, 'g'), '')
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
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
