import uid from 'uid'

const MO = window.MutationObserver || window.WebkitMutationObserver

/**
 * Check if element matches selector.
 * @param {Element} el
 * @param {selector} selector
 * @return {boolean}
 */
function matches (el, selector) {
  if ((typeof selector) === 'string') {
    return el::(
      el.matches ||
      el.matchesSelector ||
      el.msMatchesSelector ||
      el.mozMatchesSelector ||
      el.webkitMatchesSelector ||
      el.oMatchesSelector
    )(selector)
  } else if (Element.prototype.isPrototypeOf(selector)) {
    return el === selector
  } else if (
    NodeList.prototype.isPrototypeOf(selector) ||
    Array.isArray(selector)
  ) {
    let match = false
    selector.forEach((compareTo) => {
      match = matches(el, compareTo)
      if (match) return false
    })
    return match
  } else {
    return false
  }
}

/**
 * Nilbog style observer wrapping MutationObserver.
 * Simple operations that store params and parent element for easy connect/disconnect.
 */
class Observer {
  /**
   * Initialize observer.
   * @param {selector} selector
   * @param {Element} parent - Element to observe
   * @param {MutationObserverInit} observerParams - Params passed when connecting observer.
   * @param {function} fn - Function to call on mutation. Bound to Observer.
   * @param {...*} [extras] - Any other pertinent info
   */
  constructor (selector, parent, observerParams, fn, ...extras) {
    /**
     * Element selector
     * @member {selector}
     */
    this.selector = selector

    /**
     * Internal MutationObserver
     * @member {MutationObserver}
     */
    this.observer = new MO(this::fn)

    /**
     * Element to observe
     * @member {Element}
     */
    this.parent = parent

    /**
     * Params passed when connecting observer.
     * @member {MutationObserverInit}
     */
    this.params = observerParams

    /**
     * Is the Observer currently observing?
     * @member {boolean}
     */
    this.connected = false

    /**
     * Any other pertinent info
     * @member {Array}
     */
    this.extras = extras

    /**
     * Unique identifier
     * @member {string}
     */
    this.uid = uid()
  }

  /**
   * Does element match observer selector?
   * @param {Element} el
   * @return {boolean}
   */
  matches (el) {
    return matches(el, this.selector)
  }

  /**
   * Returns UID.
   * @return {string}
   */
  inspect () {
    return this.uid
  }

  /**
   * Is this Observer equal to another?
   * @param {Observer} other
   * @return {boolean}
   */
  equals (other) {
    return this.uid === other.uid
  }

  /**
   * Start observing.
   */
  connect () {
    if (!this.connected) {
      this.observer.observe(this.parent, this.params)
      this.connected = true
    }
    return true
  }

  /**
   * Suspend observing.
   */
  disconnect () {
    if (this.connected) {
      this.observer.disconnect()
      this.connected = false
    }
    return true
  }

  /**
   * Suspend observing to operate on the elements. This prevents your action from being reverted.
   * @param {function|Promise} fn - Bound to Observer.
   * @return {?Promise<boolean>}
   */
  operate (fn) {
    if (this.connected) {
      if (typeof fn === 'function') {
        this.disconnect()
        this::fn()
        this.connect()
      } else if (Promise.prototype.isPrototypeOf(fn)) {
        return Promise.resolve(this.disconnect())
          .then(() => this::fn())
          .finally(() => Promise.resolve(this.connect()))
      }
    } else {
      if (typeof fn === 'function') {
        this::fn()
      } else if (Promise.prototype.isPrototypeOf(fn)) {
        return Promise.resolve(this::fn())
          .finally(() => Promise.resolve(true))
      }
    }
  }
}

export default Observer
