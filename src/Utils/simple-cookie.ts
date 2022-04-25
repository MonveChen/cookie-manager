/*
 * @Author: Monve
 * @Date: 2022-04-25 16:19:46
 * @LastEditors: Monve
 * @LastEditTime: 2022-04-25 17:09:18
 * @FilePath: /cookie-manager/src/Utils/simple-cookie.ts
 */
export type Cookie = {
  name: string // cookie name
  value: string // cookie value
  expires?: string | number | Date  // expire date (default type is Date)
  path?: string // cookie path, defaults to /
  domain?: string // cookie domain
  httponly?: boolean // defaults to false
  secure?: boolean // defaults to false
  samesite?: string // defaults to empty string
}

function printExpires(expires: string | number | Date) {
  if (!expires) return false;
  if (typeof expires == 'string') expires = new Date(expires);
  if (typeof expires == 'number') expires = new Date(expires);
  let n = (expires.valueOf() - (new Date()).valueOf()) / 1000;
  return 'Expires=' + expires.toUTCString() + ';Max-Age=' + Math.round(n);
}

export const simpleCookie = {
  stringify: function (obj: Cookie) {
    let value;
    try {
      value = encodeURIComponent(obj.value);
    } catch (e) {
      value = obj.value;
    }
    return [

      obj.name + '=' + value,
      (typeof obj.expires != 'undefined' && obj.expires ? printExpires(obj.expires) : ''),
      (typeof obj.path != 'undefined' ? (obj.path ? 'Path=' + obj.path : '') : 'Path=/'),
      (typeof obj.domain != 'undefined' && obj.domain ? 'Domain=' + obj.domain : ''),
      (typeof obj.secure != 'undefined' && obj.secure ? 'secure' : ''),
      (typeof obj.httponly != 'undefined' && obj.httponly ? 'HttpOnly' : ''),
      (typeof obj.samesite != 'undefined' && obj.samesite ? 'SameSite=' + obj.samesite : '')

    ].join(';').replace(/;+/g, ';').replace(/;$/, '').replace(/;/g, '; ');
  },
  parse: function (string: string, path?: string, domain?: string) {
    let s = string.replace(/;\s+/g, ';').split(';')
      .map(function (s) { return s.replace(/\s+\s+/g, '=').split('='); });

    let n = s.shift();

    let obj: any = {};
    obj.expires = false;
    obj.httponly = false;
    obj.secure = false;
    obj.path = path || '/';
    obj.domain = domain || '';
    obj.samesite = '';

    const f: { [key: string]: Function } = {
      httponly: function () { obj.httponly = true; },
      secure: function () { obj.secure = true; },
      expires: function (v: Date) { obj.expires = new Date(v); },
      'max-age': function (v: number) { if (obj.expires) return; obj.expires = new Date((new Date()).valueOf() + (v * 1000)); },
      path: function (v: string) { obj.path = v; },
      domain: function (v: string) { obj.domain = v; },
      samesite: function (v: string) { obj.samesite = v; }
    };

    for (let ele of s) {
      const I = ele[0].toLowerCase();
      if (typeof f[I] != 'undefined') f[I](ele.length == 2 ? ele[1] : '');
    }

    if (!obj.expires) obj.expires = 0;
    obj.name = n?.shift();
    obj.value = n?.join('=');
    return obj;
  },
  tokenize: function (array: Cookie[]) {
    return array.map(function (s) { return s.name + '=' + s.value; }).join('; ');
  }
};
