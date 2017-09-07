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
npm run dev:build
npm run dev:server
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
* manifest should remove to utils/index.js
* generate file should move to statics/
* async router research
* webpack production config
* e2e test framework
* tslint
* css solution
* load ${business}.file advance
* check should rebuild dll.js
* check routes.dsl format


