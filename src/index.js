import { matches, handleList } from './utils'
import Observer from './observer'
import ActionManager from './actions'

/**
 * Element selector or element list or list of selectors
 * @typedef {Array<Element>|NodeList|Array<String>|string} selector
 */

/**
 * Trickster class that reverts changes.
 * @note Be aware of infinite loops if you have multiple Nilbogs assigned to the same elements and tasks.
 * @namespace
 */
const Nilbog = {
  /**
   * Checks if actions are in conflict
   */
  actionManager: new ActionManager(),
  /**
   * Prevent creation of certain elements.
   * @param {selector} selector
   * @param {Object} options
   * @param {boolean} [subtree=true] - Operate on tree
   * @param {Element} [parent=document.documentElement] - Parent to observe on.
   * @return {MutationObserver}
   */
  preventCreate (selector, {subtree = true, parent = document.documentElement} = {}) {
    const actionManager = this.actionManager
    const params = { childList: true, subtree }
    const observer = new Observer(parent, params, function (records) {
      records.forEach(({ addedNodes }) => {
        addedNodes.forEach((node) => {
          if (matches(node, selector) && actionManager.take('preventCreate', node, this.uid)) {
            node.remove()
          }
        })
      })
    })
    actionManager.register('preventCreate', observer.uid, selector, parent)
    observer.connect()
    return observer
  },

  /**
   * Prevent modification inner text.
   * @param {selector} selector
   * @param {Object} options
   * @param {boolean} [subtree=true] - Operate on tree
   * @param {Element} [parent=document.documentElement] - Parent to observe on.
   * @return {MutationObserver}
   */
  protectText (selector, {subtree = true, parent = document.documentElement} = {}) {
    const actionManager = this.actionManager
    const params = { characterData: true, characterDataOldValue: true, subtree: subtree }
    const observer = new Observer(parent, params, function (records) {
      records.forEach(({ type, target, oldValue }) => {
        if (type === 'characterData' && matches(target.parentNode, selector) && actionManager.take('protectText', target.parentNode, this.uid)) {
          this.operate(() => {
            target.data = oldValue
          })
        }
      })
    })
    actionManager.register('protectText', observer.uid, selector, parent)
    observer.connect()
    return observer
  },

  /**
   * Prevent modification of attributes.
   * @param {selector} selector
   * @param {Object} options
   * @param {boolean} [subtree=true] - Operate on tree
   * @param {Element} [parent=document.documentElement] - Parent to observe on.
   * @param {list} [attributes=true] - List of attributes to protect. If `true`, all attributes are protected.
   * @return {MutationObserver}
   */
  protectAttributes (selector, {subtree = true, parent = document.documentElement, attributes = true} = {}) {
    const actionManager = this.actionManager
    const attributeFilter = handleList(attributes)
    const params = {
      attributes: true,
      attributeOldValue: true,
      subtree,
      attributeFilter: attributeFilter || undefined
    }
    const observer = new Observer(parent, params, function (records) {
      records.forEach(({ attributeName, target, oldValue }) => {
        if (matches(target, selector) && attributeName !== 'class' && actionManager.take('protectAttributes', target, this.uid)) {
          this.operate(() => {
            if (oldValue !== null) {
              target.setAttribute(attributeName, oldValue)
            } else {
              target.removeAttribute(attributeName)
            }
          })
        }
      })
    })
    actionManager.register('protectAttributes', observer.uid, selector, parent)
    observer.connect()
    return observer
  },

  /**
   * Prevent modification of classes.
   * @param {selector} selector
   * @param {Object} options
   * @param {boolean} [subtree=true] - Operate on tree
   * @param {Element} [parent=document.documentElement] - Parent to observe on.
   * @param {list} [always=true] - List of classes that need to always be present. If `true`, all current classes are protected. If `false`, no current classes are protected.
   * @param {list} [prevent=true] - List of classes that are not allowed to be added. If `true`, no classes can be added. If `false`, classes can be added.
   * @return {MutationObserver}
   */
  protectClasses (selector, {subtree = true, parent = document.documentElement, always = true, prevent = true} = {}) {
    const actionManager = this.actionManager
    const alwaysClassList = handleList(always)
    const preventClassList = handleList(prevent)
    const params = {
      attributes: true,
      attributeOldValue: true,
      subtree,
      attributeFilter: ['class']
    }
    const observer = new Observer(parent, params, function (records) {
      records.forEach(({ attributeName, target, oldValue }) => {
        if (matches(target, selector) && actionManager.take('protectClasses', target, this.uid)) {
          const newClasses = target.getAttribute('class').split(' ').filter(className => className !== '')
          const oldClasses = oldValue.split(' ').filter(className => className !== '')
          const remove = newClasses.filter((className) => (!oldClasses.includes(className) && (prevent || preventClassList.includes(className))))
          const add = oldClasses.filter((className) => (!newClasses.includes(className) && (always || alwaysClassList.includes(className))))
          if (remove.length > 0 || add.length > 0) {
            const classes = [...newClasses.filter((className) => !remove.includes(className)), ...add].join(' ')
            this.operate(() => {
              target.setAttribute('class', classes)
            })
          }
        }
      })
    })
    actionManager.register('protectClasses', observer.uid, selector, parent)
    observer.connect()
    return observer
  },

  /**
   * Prevent deletion of certain elements.
   * @param {selector} selector
   * @param {Object} options
   * @param {boolean} [subtree=true] - Operate on tree
   * @param {Element} [parent=document.documentElement] - Parent to observe on.
   * @return {MutationObserver}
   */
  preventDelete (selector, {subtree = true, parent = document.documentElement} = {}) {
    const actionManager = this.actionManager
    const params = { childList: true, subtree }
    const observer = new Observer(parent, params, function (records) {
      records.forEach(({ removedNodes, target, nextSibling, previousSibling }) => {
        removedNodes.forEach((node) => {
          if (matches(node, selector) && actionManager.take('preventDelete', target, this.uid)) {
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
    actionManager.register('preventDelete', observer.uid, selector, parent)
    observer.connect()
    return observer
  },

  /**
   * Protect the element on all fronts.
   * @param {selector} selector
   * @param {Object} options
   * @return {Object<MutationObserver>}
   */
  all (...args) {
    return {
      protectText: this.protectText(...args),
      preventDelete: this.preventDelete(...args),
      protectAttributes: this.protectAttributes(...args),
      protectClasses: this.protectClasses(...args)
    }
  }
}

module.exports = Nilbog
