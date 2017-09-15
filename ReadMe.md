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
yarn install

npm run dll  # only once
npm run build
npm run server
```

## Convention
* lint
  * `npm run lint.client && npm run lint.nodejs`
  * pre-commit quality works, here is a sample
  ```
  #!/bin/sh

  function check_result {
    if [ $? -ne 0 ]; then
      echo "\033[31m$@\033[0m"
      exit 1
    fi
  }

  echo "\033[32mlint ...\033[0m";
  npm run lint.nodejs && npm run lint.client
  check_result
  ```

* console
  * `console.warn` as debug info
  * `console.info` as logs
  * `console.error` as must handled error

* throw
  * just ignore, like `try { JSON.parse(data) } catch(e) {} `
  * continue throw, like `try { await getUserId() } catch(e) { throw e } `
  * report to errors handle platform, like `sentry`

* __DO NOT USE__
  * `console.log`
  * `eval`


## TODO
* P0 e2e test --watch options
* P0 e2e test framework
* P0 unit test history router
* P0 css solution
* P0 publish blog as readMe prototype
* P1 fs, path => node.js
* P1 webpack production config
* P1 load ${business}.file advance
* P2 check should rebuild dll.js
* P2 check routes.dsl format
* P2 server rendering
* P2 pagestate
* P2 open controled browser instance
* ~~P0 generate unit test entry file~~
* ~~P0 History Router~~
* ~~P0 tslint~~


