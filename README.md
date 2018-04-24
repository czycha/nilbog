# Nilbog

> MutationObserver shortcuts to prevent certain actions on nodes.

## Table of contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
	- [Constructor](#constructor)
	- [Prevent creation](#prevent-create)
	- [Prevent deletion](#prevent-delete)
	- [Protect text](#protect-text)
	- [Protect attributes](#protect-attributes)
	- [Protect classes](#protect-classes)
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

## Usage

```js
import Nilbog from 'nilbog'

const nilbog = new Nilbog()

nilbog.preventCreate('.prevent-create')
nilbog.preventDelete('.prevent-delete')
nilbog.protectText('.protect-text')
nilbog.protectAttributes('.protect-attributes')
nilbog.protectClasses('#protect-classes')
nilbog.freeze('#freeze')
```

_View the [test folder](./test/) for working examples._

## API

### <a id="constructor"></a>var nilbog = new Nilbog(safe)

Creates a new Nilbog instance.

- `safe` (optional, default: `true`) - Prevents conflicts between multiple Nilbog observers.

### <a id="prevent-create"></a>nilbog.preventCreate(selector, options = {})

Prevents creation of elements matching `selector`. Valid `options` keys include:

- `parent` (optional, default: `document.documentElement`) - DOM element to watch on.

#### ⚠ Conflict warning

If a `preventCreate` and `preventDelete` observer operate on the same element, Nilbog takes no action.

### <a id="prevent-delete"></a>nilbog.preventDelete(selector, options = {})

Prevents deletion of elements matching `selector`. Valid `options` keys include:

- `parent` (optional, default: `document.documentElement`) - DOM element to watch on.

**Note:** If a matching element is a child of an element that is deleted, nothing will happen. This might be an option later on.

#### ⚠ Conflict warning

If a `preventCreate` and `preventDelete` observer operate on the same element, Nilbog takes no action.

### <a id="protect-text"></a>nilbog.protectText(selector, options = {})

Prevents modification of inner text of elements matching `selector`. Valid `options` keys include:

- `parent` (optional, default: `document.documentElement`) - DOM element to watch on.

### <a id="protect-attributes"></a>nilbog.protectAttributes(selector, options = {})

Can prevent modification, creation, and deletion of attributes belonging to elements matching `selector`. Valid `options` keys include:

- `parent` (optional, default: `document.documentElement`) - DOM element to watch on.
- `rules` (optional) - Ruleset
	- `rules.allow` (optional, default: `false`) - Which actions are allowed on which attributes. If `false`, no actions are allowed. If `true`, all actions are allowed.
		- `rules.allow.create` (optional, default: `false`) - Which attributes are allowed to be created. If `false`, no attributes. If `true`, all attributes. Otherwise, use an array of attribute names (ex. `['attr1', 'attr2']`).
		- `rules.allow.delete` (optional, default: `false`) - Which attributes are allowed to be deleted. If `false`, no attributes. If `true`, all attributes. Otherwise, use an array of attribute names (ex. `['attr1', 'attr2']`).
		- `rules.allow.modify` (optional, default: `false`) - Which attributes are allowed to be modified. If `false`, no attributes. If `true`, all attributes. Otherwise, use an array of attribute names (ex. `['attr1', 'attr2']`).
	- `rules.prevent` (optional, default: `true`) - Which actions are prevented on which attributes. If `false`, no actions are prevented. If `true`, all actions are prevented.
		- `rules.prevent.create` (optional, default: `true`) - Which attributes are prevented from being created. If `false`, no attributes. If `true`, all attributes. Otherwise, use an array of attribute names (ex. `['attr1', 'attr2']`).
		- `rules.prevent.delete` (optional, default: `true`) - Which attributes are prevented from being deleted. If `false`, no attributes. If `true`, all attributes. Otherwise, use an array of attribute names (ex. `['attr1', 'attr2']`).
		- `rules.prevent.modify` (optional, default: `true`) - Which attributes are prevented from being modified. If `false`, no attributes. If `true`, all attributes. Otherwise, use an array of attribute names (ex. `['attr1', 'attr2']`).

**Note:** Will not operate on the `class` attribute. Use `nilbog.protectClasses()` instead.

#### Example rulesets

```js
// Preserve current attributes and prevent new ones
nilbog.protectAttributes('.protect-attributes--default')

// Allow all actions with exceptions
nilbog.protectAttributes('.protect-attributes--allow-most', {
  rules: {
    allow: true,
    prevent: {
      create: ['attr4'],
      delete: ['attr1'],
      modify: ['attr2']
    }
  }
})

// Prevent all actions with exceptions
nilbog.protectAttributes('.protect-attributes--allow-most', {
  rules: {
    prevent: true,
    allow: {
      create: ['attr4'],  // Will not be able to be deleted
      delete: ['attr1'],  // Will not be able to be created
      modify: ['attr2']
    }
  }
})

// Mix-match
nilbog.protectAttributes('.protect-attributes--mix-match', {
  rules: {
    prevent: {
    	  create: true,
    	  delete: ['attr1'],
    	  modify: false
    	},
    allow: {
      create: ['attr2'],
      delete: false,
      modify: true
    }
  }
})
```

### <a id="protect-classes"></a>nilbog.protectClasses(selector, options = {})

Can prevent creation, and deletion of classes belonging to elements matching `selector`. `selector` should not rely on classes for this to work efficiently. Valid `options` keys include:

- `parent` (optional, default: `document.documentElement`) - DOM element to watch on.
- `rules` (optional) - Ruleset
	- `rules.allow` (optional, default: `false`) - Which actions are allowed on which classes. If `false`, no actions are allowed. If `true`, all actions are allowed.
		- `rules.allow.create` (optional, default: `false`) - Which classes are allowed to be created. If `false`, no classes. If `true`, all classes. Otherwise, use an array of class names (ex. `['class-1', 'class-2']`).
		- `rules.allow.delete` (optional, default: `false`) - Which classes are allowed to be deleted. If `false`, no classes. If `true`, all classes. Otherwise, use an array of class names (ex. `['class-1', 'class-2']`).
	- `rules.prevent` (optional, default: `true`) - Which actions are prevented on which classes. If `false`, no actions are prevented. If `true`, all actions are prevented.
		- `rules.prevent.create` (optional, default: `true`) - Which classes are prevented from being created. If `false`, no classes. If `true`, all classes. Otherwise, use an array of class names (ex. `['class-1', 'class-2']`).
		- `rules.prevent.delete` (optional, default: `true`) - Which classes are prevented from being deleted. If `false`, no classes. If `true`, all classes. Otherwise, use an array of class names (ex. `['class-1', 'class-2']`).

#### Example rulesets

```js
// Preserve current classes and prevent new ones
nilbog.protectAttributes('#protect-classes--default')

// Allow all actions with exceptions
nilbog.protectClasses('#protect-classes--allow-most', {
  rules: {
    allow: true,
    prevent: {
      create: ['class-4'],
      delete: ['class-1']
    }
  }
})

// Prevent all actions with exceptions
nilbog.protectClasses('#protect-classes--allow-most', {
  rules: {
    prevent: true,
    allow: {
      create: ['class-4'],  // Will not be able to be deleted
      delete: ['class-1']  // Will not be able to be created
    }
  }
})

// Mix-match
nilbog.protectClasses('#protect-classes--mix-match', {
  rules: {
    prevent: {
    	  create: true,
    	  delete: ['class-1'],
    	  modify: false
    	},
    allow: {
      create: ['class-2'],
      delete: false,
      modify: true
    }
  }
})
```

## Name

> [“Nilbog... it's Goblin spelled backwards!”](https://www.youtube.com/watch?v=zQcKXPRBmpE)

On top of being the name of the town in the amazing _Troll 2_, a nilbog is a creature found in tabletop roleplaying games such as Dungeons & Dragons and Pathfinder. The nilbogs have an ability called "Reveral of Fortune" that causes those around it to act opposite of their own desires, much like this module!

## See also

- [`MutationObserver` documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## License

[MIT](LICENSE) &copy; James Anthony Bruno

