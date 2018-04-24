import Observer from './observer'
import ConflictManager from './conflicts'
import Referee from './referee'

/**
 * @typedef {Object} VennDiagram - Inclusive and exclusive elements between two arrays.
 * @property {Array} left - Items exclusive to the left argument
 * @property {Array} right - Items exclusive to the right argument
 * @property {Array} middle - Items shared between the two
 */

/**
 * Creates a Venn diagram showing the inclusive/exclusive elements of two arrays.
 * @param {Array} left
 * @param {Array} right
 * @returns {VennDiagram}
 */
function venn (left, right) {
  return {
    left: left.filter((a) => !right.includes(a)),
    right: right.filter((a) => !left.includes(a)),
    middle: left.filter((a) => right.includes(a))
  }
}

/**
 * @typedef {Object} BinaryDiff - What is added or removed. No modification.
 * @property {Array} added
 * @property {Array} removed
 */

/**
 * Find what was added or removed.
 * @param {Array} newArr
 * @param {Array} oldArr
 * @return {BinaryDiff}
 */
function arrDiff (oldArr, newArr) {
  const { left: added, right: removed } = venn(newArr, oldArr)
  return {
    added,
    removed
  }
}

/**
 * Element selector or element list or list of selectors
 * @typedef {Array<Element>|NodeList|Array<String>|string} selector
 */

/**
 * Trickster class that reverts changes.
 */
class Nilbog {
  /**
   * @param {boolean} [safe=true] - Keeps a record of all observers to ensure that they don't create feedback loops.
   */
  constructor (safe = true) {
    /**
     * Keep a record of all observers to ensure that they don't create feedback loops.
     * @member {boolean}
     */
    this.safe = safe

    /**
     * Helps resolve conflicts between multiple observers. If `this.safe` is false, will not do anything.
     * @member {ConflictManager}
     */
    this.conflictManager = new ConflictManager(!this.safe)
  }

  /**
   * Prevent creation of certain elements.
   * @param {selector} selector
   * @param {Object} [options]
   * @param {boolean} [options.subtree=true] - Operate on tree
   * @param {Element} [options.parent=document.documentElement] - Parent to observe on.
   * @return {Observer}
   */
  preventCreate (selector, {subtree = true, parent = document.documentElement} = {}) {
    const conflictManager = this.conflictManager
    const params = { childList: true, subtree }
    const observer = new Observer(selector, parent, params, function (records) {
      records.forEach(({ addedNodes }) => {
        addedNodes.forEach((node) => {
          if (this.matches(node) && conflictManager.resolve('preventCreate', this, node)) {
            node.remove()
          }
        })
      })
    })
    conflictManager.register('preventCreate', observer)
    observer.connect()
    return observer
  }

  /**
   * Prevent modification inner text.
   * @param {selector} selector
   * @param {Object} [options]
   * @param {boolean} [options.subtree=true] - Operate on tree
   * @param {Element} [options.parent=document.documentElement] - Parent to observe on.
   * @return {Observer}
   */
  protectText (selector, {subtree = true, parent = document.documentElement} = {}) {
    const conflictManager = this.conflictManager
    const params = { characterData: true, characterDataOldValue: true, subtree: subtree }
    const observer = new Observer(selector, parent, params, function (records) {
      records.forEach(({ type, target, oldValue }) => {
        if (type === 'characterData' && this.matches(target.parentNode) && conflictManager.resolve('protectText', this, target.parentNode)) {
          this.operate(() => {
            target.data = oldValue
          })
        }
      })
    })
    conflictManager.register('protectText', observer)
    observer.connect()
    return observer
  }

  /**
   * Prevent modification of attributes.
   * @param {selector} selector
   * @param {Object} [options]
   * @param {boolean} [options.subtree=true] - Operate on tree
   * @param {Element} [options.parent=document.documentElement] - Parent to observe on.
   * @param {APRules} [options.rules]
   * @return {Observer}
   */
  protectAttributes (selector, {
    subtree = true,
    parent = document.documentElement,
    rules = { prevent: true, allow: false }
  } = {}) {
    const conflictManager = this.conflictManager
    const allow = Referee.normalize(rules.allow)
    const prevent = Referee.normalize(rules.prevent)
    const attributeFilter = Referee.filter({ allow, prevent })
    const params = {
      attributes: true,
      attributeOldValue: true,
      subtree,
      attributeFilter
    }
    const observer = new Observer(selector, parent, params, function (records) {
      records.forEach(({ attributeName, target, oldValue }) => {
        if (this.matches(target) && attributeName !== 'class') {
          const changed = { added: [], removed: [], modified: [] }
          let undoThis
          if (oldValue === null) {
            changed.added.push(attributeName)
            undoThis = 'create'
          } else if (!target.hasAttribute(attributeName)) {
            changed.removed.push(attributeName)
            undoThis = 'delete'
          } else if (oldValue !== target.getAttribute(attributeName)) {
            changed.modified.push(attributeName)
            undoThis = 'modify'
          } else {
            return false
          }
          let undo = Referee.deliberate({ allow, prevent }, changed)
          const resolution = conflictManager.resolve('protectAttributes', this, target, undo)
          if (resolution !== true) undo = resolution
          if (undo[undoThis].length === 1) {
            this.operate(() => {
              switch (undoThis) {
                case 'create':
                  target.removeAttribute(attributeName)
                  break
                case 'delete':
                case 'modify':
                  target.setAttribute(attributeName, oldValue)
                  break
              }
            })
          }
        }
      })
    }, { allow, prevent })
    conflictManager.register('protectAttributes', observer)
    observer.connect()
    return observer
  }

  /**
   * Prevent modification of classes.
   * @param {selector} selector - Suggested to not be a class.
   * @param {Object} [options]
   * @param {boolean} [options.subtree=true] - Operate on tree
   * @param {Element} [options.parent=document.documentElement] - Parent to observe on.
   * @param {APRules} [options.rules]
   * @return {Observer}
   */
  protectClasses (selector, {
    subtree = true,
    parent = document.documentElement,
    rules = { prevent: true, allow: false }
  } = {}) {
    const conflictManager = this.conflictManager
    const allow = Referee.normalize(rules.allow)
    const prevent = Referee.normalize(rules.prevent)
    const params = {
      attributes: true,
      attributeOldValue: true,
      subtree,
      attributeFilter: ['class']
    }
    const observer = new Observer(selector, parent, params, function (records) {
      records.forEach(({ attributeName, target, oldValue }) => {
        if (this.matches(target)) {
          const newClasses = target.getAttribute('class').split(' ').filter(className => className !== '')
          const oldClasses = oldValue.split(' ').filter(className => className !== '')
          const changed = arrDiff(oldClasses, newClasses)
          let undo = Referee.deliberate({ allow, prevent }, changed)
          const resolution = conflictManager.resolve('protectClasses', this, target, undo)
          if (resolution !== true) undo = resolution
          if (undo.delete.length > 0 || undo.create.length > 0) {
            const classes = [...newClasses.filter((className) => !undo.create.includes(className)), ...undo.delete].join(' ')
            this.operate(() => {
              target.setAttribute('class', classes)
            })
          }
        }
      })
    }, { allow, prevent })
    conflictManager.register('protectClasses', observer)
    observer.connect()
    return observer
  }

  /**
   * Prevent deletion of certain elements.
   * @param {selector} selector
   * @param {Object} [options]
   * @param {boolean} [options.subtree=true] - Operate on tree
   * @param {Element} [options.parent=document.documentElement] - Parent to observe on.
   * @return {Observer}
   */
  preventDelete (selector, {subtree = true, parent = document.documentElement} = {}) {
    const conflictManager = this.conflictManager
    const params = { childList: true, subtree }
    const observer = new Observer(selector, parent, params, function (records) {
      records.forEach(({ removedNodes, target, nextSibling, previousSibling }) => {
        removedNodes.forEach((node) => {
          if (this.matches(node) && conflictManager.resolve('preventDelete', this, node)) {
            if (!nextSibling && !previousSibling) {
              target.appendChild(node)
            } else if (nextSibling) {
              target.insertBefore(node, nextSibling)
            } else if (previousSibling) {
              previousSibling.insertAdjacentHTML('beforebegin', node)
            }
          }
        })
      })
    })
    conflictManager.register('preventDelete', observer)
    observer.connect()
    return observer
  }

  /**
   * Protect the element on all fronts.
   * @param {selector} selector
   * @param {Object} [options]
   * @return {Object<Observer>}
   */
  freeze (...args) {
    return {
      protectText: this.protectText(...args),
      preventDelete: this.preventDelete(...args),
      protectAttributes: this.protectAttributes(...args),
      protectClasses: this.protectClasses(...args)
    }
  }
}

module.exports = Nilbog
