# Fronted End Starter

> Lighter & No complex config Starter

## Keywords

* TypeScript
* React
* Mobx
* Koa
* Webpack

## Development

```
npm run dll # only once
npm run build
npm run server

# shorthand but take much time
npm run dev
```

## Convention
* console
  * __DO NOT USE__ `console.log`
  * `console.warn` as debug info
  * `console.info` as logs
  * `console.error` as must handled error

* throw
  * just ignore, like `try { JSON.parse(data) } catch(e) {} `
  * continue throw, like `try { await getUserId() } catch(e) { throw e } `
  * report to errors handle platform, like `sentry`


## TODO
* P0 unit test history router
* P0 tslint
* P0 e2e test framework
* P0 css solution
* P1 fs, path => node.js
* P1 webpack production config
* P1 load ${business}.file advance
* P2 check should rebuild dll.js
* P2 check routes.dsl format
* P2 server rendering
* P2 pagestate


