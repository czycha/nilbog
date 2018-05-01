# Nilbog

> MutationObserver shortcuts to prevent certain actions on nodes.

## Table of contents

- [Install](#install)
- [Usage](#usage)
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

## API

See the [Wiki](https://github.com/czycha/nilbog/wiki) for the complete API.

## Name

> [“Nilbog... it's Goblin spelled backwards!”](https://www.youtube.com/watch?v=zQcKXPRBmpE)

On top of being the name of the town in the amazing _Troll 2_, a nilbog is a creature found in tabletop roleplaying games such as Dungeons & Dragons and Pathfinder. The nilbogs have an ability called "Reveral of Fortune" that causes those around it to act opposite of their own desires, much like this module!

## See also

- [`MutationObserver` documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## License

[MIT](LICENSE) &copy; James Anthony Bruno

