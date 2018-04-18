import { matches } from './utils'

/**
 * Action entry
 */
class ActionEntry {
  /**
   * Create ActionEntry
   * @param {string} uid - Observer UID
   * @param {selector} selector - Observer selector
   * @param {Element} parent - Observer parent
   */
  constructor (uid, selector, parent) {
    this.uid = uid
    this.selector = selector
    this.parent = parent
  }

  /**
   * Checks if entry is conflicting with Observer with UID acting on node
   * @param {Element} node
   * @param {string} uid - Observer UID
   * @return {boolean}
   */
  conflicts (node, uid) {
    return this.uid !== uid && this.parent.contains(node) && matches(node, this.selector)
  }
}

/**
 * Manages actions, preventing infinite loops.
 */
export default class ActionManager {
  /**
   * Create ActionManager
   */
  constructor () {
    this.actions = Object.freeze([
      'preventCreate',
      'preventDelete',
      'protectText',
      'protectClasses',
      'protectAttributes'
    ])
    this.entries = {}
    this.actions.forEach((action) => {
      this.entries[action] = {}
    })
  }

  /**
   * Register action observer.
   * @param {string} action - Action key
   * @param {string} uid - Observer UID
   * @param {selector} selector
   * @param {Element} parent
   */
  register (action, uid, selector, parent) {
    if (!this.entries[action][uid]) {
      this.entries[action][uid] = new ActionEntry(uid, selector, parent)
    }
  }

  /**
   * Detects conflicts for Observer action taken on node
   * @param {string} action - Action key
   * @param {Element} node - Node acted on
   * @param {string} uid - Observer uid
   * @return {Array<ActionEntry>} - Conflicting `ActionEntry`s
   */
  conflicts (action, node, uid) {
    return Object.values(this.entries[action]).filter((entry) => entry.conflicts(node, uid))
  }

  /**
   * Settles dispute between conflicting entries.
   * @param {string} uid - Observer uid
   * @param {Array<ActionEntry>}
   */
  settleDispute (uid, conflicts) {
    const uids = conflicts.map(({ uid }) => uid)
    uids.push(uid)
    return uids.sort()[0] === uid
  }

  /**
   * Can I take this action? Settles disputes if any.
   * @param {string} action - Action key
   * @param {Element} node - Node acted on
   * @param {string} uid - Observer uid
   * @return {boolean}
   */
  take (action, node, uid) {
    const conflicts = this.conflicts(action, node, uid)
    return conflicts.length === 0 || (
      console.warn(`Nilbog ${action}: ${conflicts.length} conflicts found`), this.settleDispute(uid, conflicts)
    )
  }
}
