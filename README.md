# Nilbog

> MutationObserver shortcuts to prevent certain actions on nodes.

Nilbog will reverse certain actions taken on nodes, preserving an original state. Currently, Nilbog can prevent creation and deletion, as well as protect the text, attributes, and classes of nodes.

## Table of contents

- [Install](#install)
- [Usage](#usage)
  - [Adding to page](#adding-to-page)
- [Browser compatibility](#browser-compatibility)
- [API](https://github.com/czycha/nilbog/wiki)
- [Name](#name)
- [See also](#see-also)
- [License](#license)

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install nilbog
```

Or, with [Yarn](https://yarnpkg.com/en/),

```
$ yarn add nilbog
```

Alternatively, download [nilbog.min.js](browser/nilbog.min.js)

## Usage

```js
const nilbog = new Nilbog()

nilbog.preventCreate('.prevent-create')
nilbog.preventDelete('.prevent-delete')
nilbog.protectText('.protect-text')
nilbog.protectAttributes('.protect-attributes')
nilbog.protectClasses('#protect-classes')
nilbog.freeze('#freeze')
```

_View the [test folder](./test/) for working examples._

### Adding to page

Import directly into your JavaScript (for use with tools like Webpack, Browserify, and Parcel):

```js
import Nilbog from 'nilbog'

const nilbog = new Nilbog()
```

Or, use [nilbog.min.js](browser/nilbog.min.js):

```html
<script type="text/javascript" src="js/nilbog.min.js"></script>
<script type="text/javascript">
  var nilbog = new Nilbog()
</script>
```

**Note on script placement:** If the script where you define Nilbog observers executes before element rendering, the following side-effects may occur depending on the type of observers:
  - `preventCreate` will not allow any subsequent matching nodes from rendering, even if they were originally on the page. (This may actually be to your advantage if you'd like to employ this sort of behavior.)
  - `protectText` will prevent protected elements from having any inner text, due to the element originally having no text as it renders it's full tree.

## Browser compatibility

Nilbog is based entirely on the `MutationObserver` native class (including the prefixed `WebkitMutationObserver`). If this class is [not present](https://caniuse.com/#feat=mutationobserver), Nilbog will not work at all.

Nilbog is written in ES6 which is transpiled using Babel. It does not include polyfills for some ES6 features that are not handled by Babel, such as `Array.from`, `Array.prototype.filter`, etc. because this could add unnecessary bloat and logic in case these features are already polyfilled. This affects only unsupported browsers such as IE <= 11. If you intend to support such browsers, I suggest using [polyfill.io](https://polyfill.io/) or [core-js](https://github.com/zloirock/core-js).

## API

See the [Wiki](https://github.com/czycha/nilbog/wiki) for the complete API.

## Name

> [“Nilbog... it's Goblin spelled backwards!”](https://www.youtube.com/watch?v=zQcKXPRBmpE)

On top of being the name of the town in the amazing _Troll 2_, a nilbog is a creature found in tabletop roleplaying games such as Dungeons & Dragons and Pathfinder. The nilbogs have an ability called "Reveral of Fortune" that causes those around it to act opposite of their own desires, much like this module!

## See also

- [`MutationObserver` documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## License

[MIT](LICENSE) &copy; James Anthony Bruno

