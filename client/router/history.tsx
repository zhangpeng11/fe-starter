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

export type RouteArg = {
  path: string;
  query: Query;
  hash: string;
}

type hookArgs = {
  hook: Function | undefined;
  from: UrlParser,
  to: UrlParser
}

export default class HistoryRouter {
  constructor(routes: Routes) {
    this.current = undefined;
    this.routes = routes;
    this.url = new UrlParser(location.href);
    this.initRoutes();

    window.addEventListener('load', () => this.register());

    // 1. from user click back/forward
    // 2. from router api push/replace
    window.addEventListener('popstate', () => this.register());
  }

  push(path: Path) {
    this.changeHistory(path, false);
  }

  replace(path: Path) {
    this.changeHistory(path, true);
  }

  private url: UrlParser;
  private current: Route | undefined;
  private routes: Routes;

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

  private changeHistory(path: Path, replace: boolean) {
    const newUrl = this.url.update(path);

    // same url do nothing
    if (this.url == newUrl) {
      return console.warn('The URL just same');
    }

    const route = this.match(newUrl) as RouteOptions;
    const current = this.current;

    if (route) {
      const args = {
        hook: current && (current  as RouteOptions).beforeLeave,
        from: this.url,
        to: newUrl
      };

      this.runHooks2(args, () => {
        const change = replace
          ? history.replaceState
          : history.pushState;
        change.call(history, null, '', newUrl.path);
        this.transition(route, newUrl, replace);
      })
    } else {
      console.error('Did you register route correct ? got', path);
    }
  }

  /** if current path mathed return matched route */
  private match(url: UrlParser) {
    for (let path in this.routes) {
      if (isPathSame(path, url.path)) {
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
    const url = new UrlParser(location.href);
    const route = this.match(url);

    if (route) {
      this.transition(route, url, false);
    }
  }

  private transition(route: Route, url: UrlParser, replaced: boolean) {
    const reject = () => this.rollback(replaced);
    const action = () => {
      this.mount(route);
      this.url = url;
      this.current = route;
    }
    const args = {
      hook: (route as RouteOptions).beforeEnter,
      from: this.url,
      to: url
    }

    this.runHooks2(args, action, reject);
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

  private rollback(repalced: boolean) {
    repalced
      ? history.replaceState(null, '', this.url.href)
      : history.back();
  }

  private runHooks2(args: hookArgs, action: Function, reject?: Function) {
    let hook = args.hook;
    let from = args.from;
    let to = args.to;
    let prevented = false;
    let prevent = () => {
      prevented = true;
    }

    hook && hook(from, to, prevent);
    prevented ? (reject && reject()) : action();
  }
}

export type Query = {
  [k: string]: string | number | undefined;
}

export type PathOptions = {
  path: string;
  query?: Query;
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
      const query = opts.query || {};

      Object.keys(query).forEach(key => {
        const value = encode(query[key] as string);
        search.push(`${key}=${value}`);
      });

      return `${opts.path}/?${search.join('&')}`;
    } else {
      return path as string;
    }
  }
}

// path like `/a` & `/a/` is thought equal
function isPathSame(path1: string, path2: string) {
  const possibles1 = [path1, path1.slice(0, -1)];
  const possibles2 = [path2, path2.slice(0, -1)];
  const tmp1 = possibles1.indexOf(path2) != -1;
  const tmp2 = possibles2.indexOf(path1) != -1;
  return tmp1 || tmp2;
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
 * 10. DO 1 then add beforeEnter hook => next(false) cannot to the target page ✓
 * 11. DO 1 then add beforeLeave hook => next(false) cannot to the target page ✓
 * 12. beforeEnter args(from, to, prevent) should be correct ✓
 * 13. beforeLeave args(from, to, prevent) should be correct ✓
 * = Test Cases ==============================================================
 */
