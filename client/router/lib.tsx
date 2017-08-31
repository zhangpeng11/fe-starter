/**
 * front-end router manager
 * by hash history,
 * usage::
 *
 * // = router.js ==========================
 * const router = new Router({
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
 *      router.push({
 *        path: '/submit',
 *        query: {id: 4399}
 *      })
 *   }
 * }
 */

import * as React from 'react'
import * as ReactDOM from "react-dom"

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

export type Path = string | PathOptions;

export type PathOptions = {
    path: string;
    query: Query;
}

export default class ReactRouter {
    constructor(routes: Routes) {
        this.routes = routes;
        this.recordHref();

        window.addEventListener('onload', () => this.register());
        window.addEventListener('hashchange', () => this.register());
    }

    push(path: Path) {
        const newUrl = this.url.update(path);
        const route = this.match(newUrl);

        if (route) {

        }
    }

    replace(path: Path) {

    }

    private href: string;
    private confilict: boolean;
    private url: UrlParser;
    private current: Route | null;
    private routes: Routes;

    private recordHref() {
        this.href = location.href;
    }

    private makeConfilict() {
        this.confilict = true;
    }

    private solveConfilict() {
        this.confilict = false;
    }

    /** if current path mathed return matched route */
    private match(url: UrlParser) {
        for (let path in this.routes) {
            if (path == url.path) {
                return this.routes[path];
            }
        }

        return null;
    }

    private register() {
        if (this.confilict) return this.solveConfilict();

        const url = this.url = new UrlParser(location.href);
        const route = this.current = this.match(url);

        if (route) {
            this.transition(route, () => {
                const Component = this.getComponent(route);
                const props = {}; // todo
                ReactDOM.render(
                    <Component {...props}></Component>,
                    document.getElementById("root")
                );
            });
        }

        this.recordHref();
    }

    /** get React ComponentClass */
    private getComponent(route: Route) {
        const opts = route as RouteOptions;

        return opts.page ? opts.page : (route as React.ComponentClass);
    }

    private transition(route: Route, action: Function) {
        const opts = route as RouteOptions;

        if (opts.page) {
            if (!this.runHooks(opts, action)) {
                this.rollback();
            }
        } else {
            action();
        }
    }

    private rollback() {
        this.makeConfilict();
        location.replace(this.href);
    }

    /** if hook not prevent return true */
    private runHooks(opts: RouteOptions, hook: Function, action: Function) {
        let shouldEnter = true;
        let prevent = () => {
            shouldEnter = false;
        }

        beforeEnter && beforeEnter(prevent);
        shouldEnter && action();

        return shouldEnter;
    }
}

export type Query = {
    [k: string]: string | number | undefined;
}

/**
 * parse url like
 * @param
 * 'http://googlebridge.com/search/#LA11/#/user/a/?q=for+in+%E5%BE%AA%E7%8E%AF&start='
 *
 * @return
 * {
 *    url: 'http://googlebridge.com/search/#LA11/#/user/a/?q=for+in+%E5%BE%AA%E7%8E%AF&start=',
 *    lastHash: '/user/a/?q=for+in+%E5%BE%AA%E7%8E%AF&start=',
 *    query: {q: 'for+in+循环', start: undefined},
 *    path: '/user/a'
 * }
 */
export class UrlParser {
    constructor(url: string) {
        if (!this.isLegalUrl()) throw new Error(`url argument must be legal format. got: ${url}`);

        this._lastHash = this.parseLastHashPart();
        this._search = this.parseSearch();
        this._path = this.parsePath();
        this._query = this.parserQuery();
    }

    get url() { return this._url }
    get lastHash() { return this._lastHash }
    get query() { return this._query }
    get path() { return this._path }

    /**
     * given a path arg
     * return a totally new parser
     * usage::
     *
     * now parser state is
     * => url: 'http://w.a.c/#/tmp/?q=3'
     * url.update('/save') =>
     * => url: 'http://w.a.c/#/save'
     */
    update(path: Path) {
        const pathStr = this.genetatePath(path);
        const urlStr = this.url.replace(this.lastHash, pathStr);

        return new UrlParser(urlStr);
    }



    private _url = '';
    private _lastHash = '';
    private _search = '';
    private _path = '';
    private _query = {} as Query;

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

    /** todo */
    private isLegalUrl() {
        return true;
    }

    /**
     * usage::
     * http://a.bbs.com/#/tmp => /tpm
     * http://a.com/#AL11/#/f => /f
     * http://a.com/#/tmp?q=1 => /tmp?q=1
     */
    private parseLastHashPart() {
        let url = this.url;
        let i = url.length - 2;

        for (; i; i--) {
            if (url[i] == '#' && url[i+1] == '/') {
                break;
            }
        }

        return url.substr(i + 1);
    }

    private parsePath() {
        // assert had got this._lastHash and this.search

        const total = this._lastHash.length;
        const tail = `?${this._search}`.length;

        return this._lastHash.substr(0, total - tail);
    }

    private parseSearch() {
        // assert had got this._lastHash
        // if (!this._lastHash) throw new Error('some error happend UrlParser itself');

        let hash = this._lastHash;
        let i = hash.length - 2;

        for ( ; i; i--) {
            if (hash[i] == '?') {
                break;
            }
        }

        return hash.substr(i + 1);
    }

    /**
     * parse query string,
     * search string like
     * q=ok&id=983&text=%3d%4e
     */
    private parserQuery() {
        // assert had got this._search

        const keyAndValues = this._search.split('&');
        const ret = {} as Query;

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
}

function decode(s: string) {
    return s === undefined ? s : decodeURIComponent(s);
}

function encode(s: string) {
    return s === undefined ? '' : encodeURIComponent(s);
}
