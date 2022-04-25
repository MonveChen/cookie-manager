/*
 * @Author: Monve
 * @Date: 2021-12-10 15:59:20
 * @LastEditors: Monve
 * @LastEditTime: 2022-04-25 18:41:42
 * @FilePath: /cookie-manager/src/CookieManager.ts
 */

import { Cookie, simpleCookie } from "./Utils/simple-cookie";

function arrayUnique(arr: Cookie[]) {
  let f: string[] = [];
  let s: Cookie[] = [];
  for (let ele of arr) {
    const g = JSON.stringify(ele);
    if (f.indexOf(g) == -1) {
      s.push(ele);
      f.push(g);
    }
  }

  return s;
}

interface extendType {
  pathReg: RegExp,
  originStr: string
}

export class CookieManager {
  domains: string[];
  domainReg: RegExp[];
  list: { [name: string]: { [name: string]: Cookie & extendType } }
  length: number;

  constructor() {
    this.reset()
  }

  reset = () => {
    this.domains = [];
    this.domainReg = [];
    this.list = {};
    this.length = 0;
  }



  store = (cook: string[], url?: string): void => {

    let defaultPath = undefined
    let defaultDomain = undefined
    if (url) {
      const u = new URL(url);
      defaultPath = u.pathname
      defaultDomain = u.hostname
    }

    if (typeof cook == 'string') cook = [cook];
    let t = this;
    for (const ele of cook) {
      let objs = simpleCookie.parse(ele, defaultPath, defaultDomain) as Cookie & extendType;
      objs.pathReg = new RegExp('^' + objs.path);
      if (!objs.domain) {
        objs.domain = 'global'
      }
      if (t.domains.indexOf(objs.domain) === -1) {
        t.list[objs.domain] = {};

        t.domains.push(objs.domain);
        let reg = objs.domain?.match(/^\./) ? objs.domain + '$' : '^' + objs.domain + '$';
        t.domainReg.push(new RegExp(reg));
      }
      objs.originStr = ele;
      t.list[objs.domain][objs.name] = objs;
    }

    //calculate length
    this.length = 0;
    for (const ele of Object.keys(t.list)) {
      for (const _ of ele) this.length++;
    }

  };

  search = (domain: string, path: string, date: string | Date | number, browser: boolean, secure: boolean): Cookie[] => {

    let f: Cookie[] = [];
    for (let i = 0; i < this.domainReg.length; i++) {
      if (!this.domainReg[i].test(domain)) continue;
      for (const j of Object.keys(this.list[this.domains[i]]))
        f.push(this.list[this.domains[i]][j]);
    }

    if (typeof date == 'string') date = new Date(date);
    date = date.valueOf();

    path = (path ? path : '/').replace(/\?.*$/, '').replace(/\#.*$/, '');

    let g: Cookie[] = [];
    for (const ele of f) {
      if (
        (ele as any).pathReg.test(path) &&
        (!ele.expires || date < ele.expires!.valueOf()) &&
        !(browser && ele.httponly) &&
        !(!secure && ele.secure)
      ) g.push(ele);
    };

    return g;

  };

  tokenize = (arr: Cookie[]): string => {

    return simpleCookie.tokenize(arrayUnique(arr));

  };

  prepare = (url: string, browser: boolean = false): string => {

    const u = new URL(url);
    const d = new Date();
    return this.tokenize(this.search(
      u.hostname,
      u.pathname,
      d,
      browser,
      u.protocol == 'https:'
    ).concat(
      this.search(
        '.' + u.hostname,
        u.pathname,
        d,
        browser,
        u.protocol == 'https:'
      )
    ));

  }

  exportOriginStrArr = (): string[] => {
    const arr: string[] = [];
    for (const domain of Object.keys(this.list)) {
      for (const key of Object.keys(this.list[domain])) {
        const { originStr } = this.list[domain][key]
        arr.push(originStr)
      }
    }
    return arr
  }

  exportStrArr = (): string[] => {
    const arr: string[] = [];
    for (const domain of Object.keys(this.list)) {
      for (const key of Object.keys(this.list[domain])) {
        const cookie = this.list[domain][key]
        arr.push(simpleCookie.stringify(cookie))
      }
    }
    return arr
  }

}