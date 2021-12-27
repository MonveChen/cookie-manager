# cookie-manager
for manager cookies

#### state
refer to https://github.com/juji/cookie-manager

#### Usage

##### CookieManager

```js
import { CookieManager } from "@monvechen/cookie-manager"

const cm = new CookieManager();

cm.store( 
 [
  'cna=111; Expires=someDate; domain=.example.com; path=/; secure',
  'name=222; Expires=someDate; domain=.example.com; path=/; HttpOnly'
   'cannel=333; Expires=someDate; domain=www.example.com; path=/; HttpOnly'
 ],
 'https://example.com/test/path'
);

const cookies = cm.prepare( 'http://example.com' );
// 'cna=111; name=222'

const arr = cm.exportOriginStrArr()
//[
//  'cna=111; Expires=someDate; domain=.example.com; path=/; secure',
//  'name=222; Expires=someDate; domain=.example.com; path=/; HttpOnly'
//  'cannel=333; Expires=someDate; domain=www.example.com; path=/; HttpOnly'
// ]

//clear all
cm.reset()
```

##### cookieTool

```js
import { cookieTool } from "@monvechen/cookie-manager"

cookieTool.parse('cna=111; Expires=someDate; domain=.example.com; path=/; secure')
//{name:'cna',value:'111',expires:'someDate', path:'/', secure:true}

cookieTool.stringify({name:'cna',value:'111',expires:'someDate', path:'/', secure:true})
//'cna=111; Expires=someDate; domain=.example.com; path=/; secure'

cookieTool.tokenize(
  [
    {name:'cna',value:'111',expires:'someDate', path:'/', secure:true},
    {name:'cannel',value:'222',expires:'someDate', path:'/', secure:true}
  ]
)
//'cna=111; cannel=222'

//clear all
cm.reset()
```

