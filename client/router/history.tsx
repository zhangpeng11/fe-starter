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
    this.fromEntry = {};
    this.url = new UrlParser(location.href);

    window.addEventListener('load', () => this.register());

    // 1. from user click back/forward
    // 2. from router api push/replace
    window.addEventListener('popstate', () => this.register());
  }

  push(path: Path) {
    const newUrl = this.url.update(path);
    const route = this.match(newUrl) as RouteOptions;

    if (route) {
      this.runHooks(route.beforeLeave, () => {
        history.pushState(null, '', newUrl.path);
        this.register();
      });
    }
  }

  replace(path: Path) {
    const newUrl = this.url.update(path);
    const route = this.match(newUrl) as RouteOptions;

    if (route) {
      this.runHooks(route.beforeLeave, () => {
        history.replaceState(null, '', newUrl.path);
        this.register();
      })
    }
  }

  private conflict: boolean;
  private url: UrlParser;
  private current: Route | null;
  private routes: Routes;
  private fromEntry: {[k: string]: boolean};

  private makeConflict() { this.conflict = true }
  private solveConflict() { this.conflict = false }

  /** if current path mathed return matched route */
  private match(url: UrlParser) {
    for (let path in this.routes) {
      const tmp = url.path.replace(path, '');

      if (tmp === '' || tmp == '/') {
        return this.routes[path];
      }
    }

    this.appendEntry(url.path); // if not match as entry

    return null;
  }

  private appendEntry(path: string) {
    this.fromEntry[path] = true;
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
    if (this.sameHref() && this.current) return;
    if (this.conflict) return this.solveConflict();

    const url = this.sameHref() ? this.url : new UrlParser(location.href);
    const route = this.current = this.match(url) as RouteOptions;

    if (route) {
      const action = () => this.mount(route);
      const reject = () => this.rollback();
      this.runHooks(route.beforeEnter, action, reject);
    }
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
    if (this.sameHref()) {
      this.makeConflict();
      history.back(); // will trigger popstate event
    }
  }

  private sameHref() {
    return this.url.href == location.href;
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

    return new UrlParser(url);
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
 * 1. push to correct page
 * 2. replace to correct page
 * 3. DO 1 then DO 1
 * 4. DO 1 then DO 2
 * 5. DO 2 then DO 1
 * 6. DO 2 then DO 2
 * 7. DO 1-6 then back to start point
 * 8. push to unregister path => path should changed but page should not change
 * 9. DO 8 then click back then DO 8 => result = result 8
 * 10. DO 1 then add beforeEnter hook => next(false) cannot to the target page
 * 11. DO 1 then add beforeLeave hook => next(false) cannot to the target page
 * * = Test Cases ==============================================================
 */
