/*
 * @Author: Monve
 * @Date: 2021-12-10 15:59:20
 * @LastEditors: Monve
 * @LastEditTime: 2021-12-13 10:33:37
 * @FilePath: /cookie-manager/src/CookieManager.ts
 */

import * as sCook from 'simple-cookie'

function arrayUnique(arr: sCook.Cookie[]) {
  let f: string[] = [];
  let s: sCook.Cookie[] = [];
  for (let i in arr) {
    const g = JSON.stringify(arr[i]);
    if (f.indexOf(g) == -1) {
      s.push(arr[i]);
      f.push(g);
    }
  }

  return s;
}

export class CookieManager {
  domains: string[];
  domainReg: RegExp[];
  list: { [name: string]: { [name: string]: sCook.Cookie } }
  length: number;

  constructor() {
    this.domains = [];
    this.domainReg = [];
    this.list = {};
    this.length = 0;
  }



  Store = (url: string, cook: string[]) => {

    const u = new URL(url);

    if (typeof cook == 'string') cook = [cook];
    let t = this;
    for (const i in cook) {
      (function () {
        let objs = cookieTool.parse(cook[i], u.pathname, u.hostname);
        (objs as any).pathReg = new RegExp('^' + objs.path);
        if (!objs.domain) {
          objs.domain = 'global'
        }
        if (t.domains.indexOf(objs.domain) === -1) {
          t.list[objs.domain] = {};

          t.domains.push(objs.domain);
          let reg = objs.domain?.match(/^\./) ? objs.domain + '$' : '^' + objs.domain + '$';
          t.domainReg.push(new RegExp(reg));
        }
        t.list[objs.domain][objs.name] = objs;
      })();
    }

    //calculate length
    this.length = 0;
    for (const i in t.list) {
      for (const _ in t.list[i]) this.length++;
    }

  };

  Search = (domain: string, path: string, date: string | Date | number, browser: boolean, secure: boolean): sCook.Cookie[] => {

    let f: sCook.Cookie[] = [];
    for (const i in this.domainReg) {
      if (!this.domainReg[i].test(domain)) continue;
      for (const j in this.list[this.domains[i]])
        f.push(this.list[this.domains[i]][j]);
    }

    if (typeof date == 'string') date = new Date(date);
    date = date.valueOf();

    path = (path ? path : '/').replace(/\?.*$/, '').replace(/\#.*$/, '');

    let g: sCook.Cookie[] = [];
    for (const i in f) {
      if (
        (f[i] as any).pathReg.test(path) &&
        (!f[i].expires || date < f[i].expires!.valueOf()) &&
        !(browser && f[i].httponly) &&
        !(!secure && f[i].secure)
      ) g.push(f[i]);
    };

    return g;

  };

  Tokenize = (arr: sCook.Cookie[]) => {

    return cookieTool.tokenize(arrayUnique(arr));

  };

  prepare = (url: string, browser: boolean = false) => {

    const u = new URL(url);
    const d = new Date();
    return this.Tokenize(this.Search(
      u.hostname,
      u.pathname,
      d,
      browser,
      u.protocol == 'https:'
    ).concat(
      this.Search(
        '.' + u.hostname,
        u.pathname,
        d,
        browser,
        u.protocol == 'https:'
      )
    ));

  }

}

export const cookieTool = {
  stringify: function (obj: sCook.Cookie) {
    return sCook.stringify(obj)
  },
  parse: function (str: string, defaultPath?: string, defaultDomain?: string) {
    return sCook.parse(str, defaultPath, defaultDomain)
  },
  tokenize: function (arr: sCook.Cookie[]) {
    return sCook.tokenize(arr)
  }
}