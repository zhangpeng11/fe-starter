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

declare const __ReactDOMRender__: Function;
declare const __ReactRenderLogs__: any[];

export type RouteOptions = {
  page: React.ComponentClass;
  beforeEnter?: Function;
  beforeLeave?: Function;
  props?: Function;
}

export type Route = React.ComponentClass | RouteOptions;

export type Routes = {
  [path: string]: Route;
}

export default class ReactRouter {
  constructor(routes: Routes) {
    this.conflict = false;
    this.current = null;
    this.routes = routes;
    this.fromEntry = {};
    this.url = new UrlParser(location.href);

    window.addEventListener('load', () => this.register());
    window.addEventListener('popstate', () => this.onpopstate());
  }

  push(path: Path) {
    const newUrl = this.url.update(path);
    const route = this.match(newUrl) as RouteOptions;

    if (route) {
      this.runHooks(route.beforeLeave, () => {
        history.pushState(null, '', newUrl.path);
        this.onpopstate();
      });
    }
  }

  replace(path: Path) {
    const newUrl = this.url.update(path);
    const route = this.match(newUrl) as RouteOptions;

    if (route) {
      this.runHooks(route.beforeLeave, () => {
        history.replaceState(null, '', newUrl.path);
        this.onpopstate();
      })
    }
  }

  // private oldHref: string;
  private conflict: boolean;
  private url: UrlParser;
  private current: Route | null;
  private routes: Routes;
  private fromEntry: {[k: string]: boolean};

  private makeConflict() { this.conflict = true }
  private solveConflict() { this.conflict = false }

  private onpopstate() {
    this.register();

    if (this.fromEntry[location.pathname]) {
      const logs = __ReactRenderLogs__;
      const last = logs.pop();

      if (last) {
          ReactDOM.render(last[0], last[1]);
      }
    }
  }

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

  private mount(route: Route) {
    const Component = this.getComponent(route);
    const tmp = (route as RouteOptions).props;
    const props = typeof tmp == 'function' ? tmp() : {};

    __ReactDOMRender__.call(
      ReactDOM,
      <Component {...(props || {}) }></Component>,
      document.getElementById("root")
    );
  }

  private register() {
    if (this.url.href == location.href) return;
    if (this.conflict) return this.solveConflict();

    const url = this.url = new UrlParser(location.href);
    const route = this.current = this.match(url) as RouteOptions;

    if (route) {
      const action = () => this.mount(route);
      const reject = () => this.rollback();
      this.runHooks(route.beforeEnter, action, reject);
    }
  }

  /** get React ComponentClass */
  private getComponent(route: Route) {
    const opts = route as RouteOptions;

    return opts.page ? opts.page : (route as React.ComponentClass);
  }

  private rollback() {
    if (this.isUnnecessary) {
      this.makeConflict();
      history.back(); // will trigger popstate event
    }
  }

  private isUnnecessary() {
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
