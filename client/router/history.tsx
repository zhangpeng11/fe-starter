/**
 * Front-end No Refresh Router Manager
 * Depend on History API & React & Location API,
 * usage::
 *
 * // = router.js ==========================
 * const router = new HistoryRouter({
 *  '/user': User,
 *  '/paper': {
 *    page: Paper,
 *    beforeEnter: (from, to, prevent) => {},
 *    beforeLeave: (from, to, prevent) => {}
 *  }
 * });
 *
 * // = index.tsx ==========================
 * class Home extend React {
 *   onClick1() {
 *     router.push('/submit');
 *   }
 *
 *   onClick2() {
 *      router.replace({
 *        path: '/submit',
 *        query: {id: 4399}
 *      })
 *   }
 * }
 */

import * as React from 'react'
import * as ReactDOM from "react-dom"

export type RouteOptions = {
  page: Function;
  alias?: string;
  beforeEnter?: Function;
  beforeLeave?: Function;
  props?: Function;
}

export type Route = RouteOptions | Function;

export type Routes = {
  [path: string]: Route;
}

export default class HistoryRouter {
  constructor(routes: Routes) {
    this.conflict = false;
    this.current = null;
    this.routes = routes;
    this.url = new UrlParser(location.href);
    this.initRoutes();

    window.addEventListener('load', () => this.register());

    // 1. from user click back/forward
    // 2. from router api push/replace
    window.addEventListener('popstate', () => this.register());
  }

  push(path: Path) {
    this.changeHistory(path);
  }

  replace(path: Path) {
    this.changeHistory(path, true);
  }

  private conflict: boolean;
  private url: UrlParser;
  private current: Route | null;
  private routes: Routes;

  private makeConflict() { this.conflict = true }
  private solveConflict() { this.conflict = false }

  /** Attention Side effect Changed `this.routes` */
  private initRoutes() {
    Object.keys(this.routes).forEach(path => {
      const opts = this.routes[path] as RouteOptions;
      if (opts.alias) {
        this.routes[opts.alias] = opts;
        delete opts.alias;
      }
    });
  }

  private changeHistory(path: Path, replace?: boolean) {
    const newUrl = this.url.update(path);

    if (this.url == newUrl) return; // same url do nothing

    const route = this.match(newUrl) as RouteOptions;

    if (route) {
      this.runHooks(route.beforeLeave, () => {
        const change = replace
          ? history.replaceState
          : history.pushState;
        change.call(history, null, '', newUrl.path);
        this.transition(route, newUrl);
      })
    } else {
      console.error(`Did you register route correct ? got path "${path}"`);
    }
  }

  /** if current path mathed return matched route */
  private match(url: UrlParser) {
    for (let path in this.routes) {
      const curPath = url.path;
      const possiblePath = path.slice(0, -1);

      // path like `/a` & `/a/` is ok with route['/a']
      if (path === curPath || possiblePath === url.path) {
        return this.routes[path];
      }
    }

    return null;
  }

  private async mount(route: Route) {
    const Component = await this.getComponent(route);
    const tmp = (route as RouteOptions).props;
    const props = typeof tmp == 'function' ? tmp() : {};

    ReactDOM.render(
      <Component {...(props || {}) }></Component>,
      document.getElementById("root")
    );
  }

  private register() {
    if (this.conflict) return this.solveConflict();

    const url = new UrlParser(location.href);
    const route = this.match(url);

    if (route) {
      this.transition(route, url);
    }
  }

  private transition(route: Route, url: UrlParser) {
    const reject = () => this.rollback();
    const action = () => {
      this.mount(route);
      this.url = url;
      this.current = route;
    }
    this.runHooks((route as RouteOptions).beforeEnter, action, reject);
  }

  /** get React ComponentClass */
  private async getComponent(route: Route) {
    const opts = route as RouteOptions;
    const asyncComponent = route as Function;

    let ret: React.ComponentClass;

    if (opts.page) {
      ret =  (await opts.page()).default;
    } else {
      ret = (await asyncComponent()).default;
    }

    return ret;
  }

  private rollback() {
    if (!this.sameHref()) {
      this.makeConflict();
      history.back(); // will trigger popstate event
    }
  }

  private sameHref(href?: string) {
    return href
      ? this.url.href == href
      : this.url.href == location.href;
  }

  /** if hook not prevented return true */
  private runHooks(hook: Function | undefined, action: Function, reject = () => { }) {
    let prevented = false;
    let prevent = () => {
      prevented = true;
    }

    hook && hook(prevent);
    prevented ? reject() : action();
  }
}

export type Query = {
  [k: string]: string | number | undefined;
}

export type PathOptions = {
  path: string;
  query: Query;
}

export type Path = string | PathOptions;


export class UrlParser {
  url: URL;
  search: string;
  path: string;
  href: string;
  query: Query;

  constructor(url: string | URL) {
    this.url = typeof url == 'string' ? new URL(url) : url;
    this.search = this.url.search;
    this.path = this.url.pathname;
    this.href = this.url.href;
    this.query = this.parserQuery();
  }

  /**
   * Given a path argument
   * Return a new parser
   * usage::
   *
   * const url = new UrlParser('http://w.a.c/tmp/?q=3')
   * const newUrl = url.update('/error')
   * console.info(newUrl.url.href) // http://w.a.c/error
   */
  update(path: Path) {
    const pathStr = this.genetatePath(path);
    const url = new URL(pathStr, this.url.origin);

    return url.href == this.href
      ? this
      : new UrlParser(url);
  }

  private parserQuery() {
    const keyAndValues = this.search.substr(1).split('&');
    const ret = Object.create(null) as Query;

    keyAndValues.forEach(kv => {
      const part = kv.split('=');
      const key = part[0];
      const value = part[1];
      if (key) {
        ret[key] = decode(value);
      }
    });

    return ret;
  }

  private genetatePath(path: Path) {
    const opts = path as PathOptions;

    if (opts.path) {
      const search = [] as string[];

      Object.keys(opts.query).forEach(key => {
        const value = encode(opts.query[key] as string);
        search.push(`${key}=${value}`);
      });

      return `${path}/?${search.join('&')}`;
    } else {
      return path as string;
    }
  }
}

function decode(s: string) {
  return s === undefined ? s : decodeURIComponent(s);
}

function encode(s: string) {
  return s === undefined ? '' : encodeURIComponent(s);
}

/**
 * = Test Cases ==============================================================
 * 1. push to correct page ✓
 * 2. replace to correct page ✓
 * 3. DO 1 then DO 1 ✓
 * 4. DO 1 then DO 2 ✓
 * 5. DO 2 then DO 1 ✓
 * 6. DO 2 then DO 2 ✓
 * 7. DO 1-6 then back to start point ✓
 * 8. push to unregister path => print warning ✓
 * 10. DO 1 then add beforeEnter hook => next(false) cannot to the target page
 * 11. DO 1 then add beforeLeave hook => next(false) cannot to the target page
 * 12. beforeEnter args(from, to, prevent) should be correct
 * 13. beforeLeave args(from, to, prevent) should be correct
 * * = Test Cases ==============================================================
 */
