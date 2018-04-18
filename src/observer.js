import uid from 'uid'

const MO = window.MutationObserver || window.WebkitMutationObserver

/**
 * Nilbog style observer wrapping MutationObserver.
 * Simple operations that store params and parent element for easy connect/disconnect.
 */
export default class Observer {
  /**
   * Initialize observer.
   * @param {Element} parent - Element to observe
   * @param {MutationObserverInit} observerParams - Params passed when connecting observer.
   * @param {function} fn - Function to call on mutation. Bound to Observer.
   */
  constructor (parent, observerParams, fn) {
    this.observer = new MO(this::fn)
    this.parent = parent
    this.params = observerParams
    this.uid = uid()
  }

  /**
   * Returns UID.
   */
  inspect () {
    return this.uid
  }

  /**
   * Start observing.
   */
  connect () {
    this.observer.observe(this.parent, this.params)
  }

  /**
   * Suspend observing.
   */
  disconnect () {
    this.observer.disconnect()
  }

  /**
   * Suspend observing to operate on the elements. This prevents your action from being reverted.
   * @param {function|Promise} fn - Bound to Observer.
   */
  operate (fn) {
    if (typeof fn === 'function') {
      this.disconnect()
      this::fn()
      return this.connect()
    } else if (Promise.prototype.isPrototypeOf(fn)) {
      return Promise.resolve(this.disconnect())
        .then(() => this::fn())
        .finally(Promise.resolve(this.connect()))
    }
  }
}
