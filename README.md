# :ru: react-russian-router :atom:
Here is the isomorphic/universal react router based on [russian-router](https://github.com/Enet/russian-router), [browser-russian-router](https://github.com/Enet/browser-russian-router) and [server-russian-router](https://github.com/Enet/server-russian-router) both for server and browser environments.

It allows you to manage routing in complex universal SPA and earn a lot of money.

- :zero: [Installation](#zero-installation)
- :one: [API](#one-api)
    - :cherries: [ReactRussianRouter](#cherries-reactrussianrouter)
    - :watermelon: [Switch](#watermelon-switch)
    - :banana: [TransitionSwitch](#banana-transitionswitch-extends-switch)
    - :pineapple: [ProgressSwitch](#pineapple-progressswitch-extends-transitionswitch)
    - :eggplant: [AsyncSwitch](#eggplant-asyncswitch-extends-switch)
    - :grapes: [FetchSwitch](#grapes-fetchswitch-extends-asyncswitch)
    - :strawberry: [ServerSwitch](#strawberry-serverswitch-extends-switch)
    - :pear: [Link](#pear-link)
    - :lemon: [MatchLink](#lemon-matchlink-extends-link)
    - :tangerine: [RussianLink](#tangerine-russianlink-extends-link)
    - :peach: [RussianMatchLink](#peach-russianmatchlink-extends-matchlink)
    - :green_apple: [Redirect](#green_apple-redirect)
    - :apple: [RussianRedirect](#apple-russianredirect-extends-redirect)
- :two: [Examples](#two-examples)
- :three: [Contributors](#three-contributors)


# :zero: Installation
To install the current version with **npm** use the command below:
```sh
npm install --save react-russian-router
```
Or if you prefer **yarn**:
```sh
yarn add react-russian-router
```

Now the package is installed and you can start using it in different environments.

For **ES6** modules:
```javascript
import {ReactRussianRouter} from 'react-russian-router';
```

For **CommonJS** modules:
```javascript
const {ReactRussianRouter} = require('react-russian-router');
```

Or you can add **UMD** bundle just to your HTML code:
```html
<script src="react-russian-router/dist/react-russian-router.js"></script>
<!-- Minified version is available react-russian-router/dist/react-russian-router.min.js -->
```

# :one: API
Since react-russian-router only extends capabilities of [russian-router](https://github.com/Enet/russian-router), [browser-russian-router](https://github.com/Enet/browser-russian-router), and [server-russian-router](https://github.com/Enet/server-russian-router), it's strongly recommended to read original documentation before usage.

The package contains a bunch of react-components, therefore description of each is a list of available props.

## :cherries: `ReactRussianRouter`
#### `routes` : object = `{}`
Routes' table for router.

#### `options` : object = `{}`
Options for router.

#### `request` : object = `null`
If react-russian-router is used on the server, it's required to pass `request` for [server-russian-router](https://github.com/Enet/server-russian-router).

#### `feedback` : object = `null`
Feedback is an object for writing important information during rendering. It's usually used on the server to realize SSR. After render it could contain array `matchObjects` and string `redirect`.

#### `onUriChange({type, reason, navigationKey})` : func = `null`
Callback, called after uri is changed. Accordingly, it's called on the browser only, because server-russian-router doesn't know about navigation.

## :watermelon: `Switch`
#### `childLimit` : number = `1`
Max number of visible `matchObjects`. Likely you don't need to render more than 1 pages at the same time.

#### `errorComponent` : node = `null`
Component, function or another renderable data, which is rendered after error is occured.

#### `initialError` : any = `null`
Error, occured before the first render of `Switch`. For example, if SSR returns an error, you can hydrate your application with that initial error and avoid flash of content. If SSR isn't used, most likely you don't need the prop.

#### `onUriChange({type, matchObjects})` : func = `null`
Callback, called after uri is changed. Note the different signature in comparison with router's callback with the same name.

#### `onError({type, error})` : func = `null`
Callback, called after error is occured.

## :banana: `TransitionSwitch extends Switch`
#### `transitionOnAppear` : bool = `false`
Should `TransitionSwitch` animate initial render or not? By default initial transition is disabled.

#### `onEnterStart({type, component, matchObjects, hiddenObjects})` : func = `null`
Callback, called for each component after enter transition is started.

#### `onEnterEnd({type, component, matchObjects, hiddenObjects})` : func = `null`
Callback, called for each component after enter transition is ended.

#### `onLeaveStart({type, component, matchObjects, hiddenObjects})` : func = `null`
Callback, called for each component after leave transition is started.

#### `onLeaveEnd({type, component, matchObjects, hiddenObjects})` : func = `null`
Callback, called for each component after leave transition is ended.

## :pineapple: `ProgressSwitch extends TransitionSwitch`
#### `transitionDuration` : number = `1000`
All transitions inside `ProgressSwitch` have the same duration, which could be changed via this prop.

#### `progressEasing` : func = `(progress) => progress`
Function, which transforms the original progress value from `0` up to `100`. It must return `0` for `0` and `100` for `100`.

## :eggplant: `AsyncSwitch extends Switch`
#### `getPayload(matchObject)` : func = `(matchObject) => Promise.resolve(matchObject.payload)`
Asynchronous getter for payload by original `matchObject` from the routes' table. It must return promise!

#### `initialPayload(matchObject)` : func = `null`
Synchronous getter for first payload to avoid flash of content after SSR. If SSR isn't used, you don't need this prop.

#### `spinnerComponent` : node = `null`
Component to render a spinner, when `AsyncSwitch` is waiting for payload.

#### `spinnerBeforeInit` : bool = `false`
Should `AsyncSwitch` render a spinner before the first payload is received or not?

#### `spinnerWhenWaiting` : bool = `false`
Should `AsyncSwitch` render a spinner, when uri is already changed, but a new payload is still not received?

#### `minWaitTime` : number = `0`
Min time of waiting for payload. It's recommended for use together with `spinnerWhenWaiting`.

#### `maxWaitTime` : number = `60000`
Max time of waiting for payload. Then an error will be thrown.

#### `onWaitStart({type, matchObjects})` : func = `null`
Callback, called when waiting for payload has started.

#### `onWaitEnd({type, matchObjects})` : func = `null`
Callback, called when waiting for payload has ended.

## :grapes: `FetchSwitch extends AsyncSwitch`
#### `extractJsPath(matchObject)` : string or func = `{payload}.js`
Function to generate path to JS code by `matchObject`. Also string can be passed. Placeholders `{payload}`, `{payload.abc}`, `{payload.Abc}` and `{payload.ABC}` will be replaced with `matchObject.payload` in different letter cases.

#### `extractCssPath(matchObject)` : string of func = `{payload}.css`
The same prop as `extractJsPath`, but is used for CSS code.

#### `cacheJs` : bool = `false`
Should `FetchSwitch` cache received JS code or not?

#### `cacheCss` : bool = `false`
Should `FetchSwitch` cache received CSS code or not?

#### `loadJs(matchObject, filePath)` : func = `null`
Custom loader for JS code. It must return a promise, resolved by string, which is loaded JS code. You haven't use `filePath` from `extractJsPath`, it's just optional.

#### `loadCss(matchObject, filePath)` : func = `null`
Custom loader for CSS code like `loadJs` (read above).

#### `loadUserData(matchObject)` : func = `null`
Asynchronous loader of custom user data, that is connected with entry point. It must return a promise, resolved by any data. That data will be passed as prop `userData` to the rendered component.

#### `initialUserData(matchObject)` : func = `null`
Synchronous loader of custom user data for first render to avoid flash of content after SSR. If SSR isn't used, you don't need this prop.

## :strawberry: `ServerSwitch extends Switch`
There are no custom props for `ServerSwitch`.

## :pear: `Link`
#### `name` : string = `null`
Route's name to generate link's href. If not specified, the prop `href` is used.

#### `params` : object = `{}`
Route's params to generate link's href. If `name` isn't specified, the prop doesn't make sense.

#### `href` : string = `null`
Prop is used only if `name` isn't specified. Just HTML attribute for the link.

#### `action` : oneOf(`['replace', 'push']`) = `'push'`
Action, executed with the history when the link is clicked.

#### `actionIfMatched` : bool = `false`
Should `Link` push/replace history, if the current location matches link's href already?

## :lemon: `MatchLink extends Link`
`MatchLink` is the same `Link`, but adds `match` class to CSS, when the current location matches a link's href.

## :tangerine: `RussianLink extends Link`
It's the same `Link`, which uses its own props as parameters to generate uri. Why is it called russian? Because it's dangerous like russian roulette!

## :peach: `RussianMatchLink extends MatchLink`
Here is the same `RussianLink`, but adds `match` class to CSS, when the current location matches a link's href.

## :green_apple: `Redirect`
#### `name` : string = `null`
Route's name to generate uri for the redirect. If not specified, the prop `href` is used.

#### `params` : object = `{}`
Route's params to generate uri for the redirect. If `name` isn't specified, the prop doesn't make sense.

#### `href` : string = `null`
Prop is used only if `name` isn't specified. It's the uri for the redirect.

#### `action` : oneOf(`['replace', 'push']`) = `'push'`
Action, executed with the history when the redirect is occured.

## :apple: `RussianRedirect extends Redirect`
It's the same `Redirect`, which uses its own props as parameters to generate uri.

# :two: Examples
I'll be making more tests and examples over the time. More than zero!

# :three: Contributors
Pull requests are welcome :feet: Let improve the package together. But, please, respect the code style.

If you don't understand how to use the router or you have additional questions about internal structure, be free to write me at [enet@protonmail.ch](enet@protonmail.ch). Also if you are looking for front-end software developer, be aware that I'm looking for a job. Check out my portfolio at [https://zhevak.name](https://zhevak.name) :cake:
