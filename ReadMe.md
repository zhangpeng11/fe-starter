## Fronted-End Starter

> A lighter Starter, no complex config.

* TypeScript
* React + Mobx

### Development

```
npm run dev:build
npm run dev:server
```

### Directory Introduction
### Dll Split
### Entries
### Code Quality
### Unit Test
### Convention
* console
  * __DO NOT USE__ `console.log`
  * `console.warn` as debug info
  * `console.info` as logs
  * `console.error` as must handled error

* throw
  * if you can sure ignore like `try { JSON.parse(data) } catch(e) {} `
  * continue throw like `try { await getUserId() } catch(e) { throw e } `
  * report to error handles platform like `sentry`


### TODO

* manifest should remove to utils/index.js
* generate file should move to statics/
* async router research
