/**
 * @typedef {Object|boolean} RuleParam - Rules to allow/prevent creation, modification, and deletion of keys in an array. `true` if you want to catch all. `false` if you want to catch none.
 * @property {Array<string>|boolean} create - Act/don't act on creation of these keys. True for everything. False or empty array for nothing. Array for only specific keys.
 * @property {Array<string>|boolean} modify - Act/don't act on modification of these keys. True for everything. False or empty array for nothing. Array for only specific keys.
 * @property {Array<string>|boolean} delete - Act/don't act on deletion of these keys. True for everything. False or empty array for nothing. Array for only specific keys.
 */

/**
 * @typedef {Object} APRules - Allow/prevent binary rules
 * @property {RuleParam} [allow=false] - Allow these actions to happen. True to allow everything. False to allow nothing. Array for exceptions for preventions.
 * @property {RuleParam} [prevent=true] - Prevent these actions from happening. True to prevent everything. False to prevent nothing. Array for exceptions to allowances.
 */

/**
 * @typedef {Object} Changelog - What has been changed between old and new sets.
 * @param {Array<string>} added
 * @param {Array<string>} removed
 * @param {Array<string>} modified
 */

/**
 * Rule interpretation helper
 */
class Referee {
  /**
   * Find only pertinent keys to watch.
   * @param {APRules} ruleset - Should be normalized
   * @return {undefined|Array<string>} - Returns `undefined` if everything should be watched.
   */
  static filter ({ prevent }) {
    const observeThese = new Set()
    let observeAll = false
    const types = ['create', 'modify', 'delete']
    types.forEach((type) => {
      const p = prevent[type]
      if (p === true) {
        observeAll = true
        return false
      }
      p.forEach((i) => { observeThese.add(i) })
    })
    return observeAll ? undefined : Array.from(observeThese)
  }

  /**
   * Normalize allow/prevent object, using default values, passing top-level booleans to child actions, and replacing `false` with empty arrays.
   * @param {RuleParam} ap
   * @return {RuleParam}
   */
  static normalize (ap) {
    if (ap === true) {
      return { create: true, delete: true, modify: true }
    } else if (ap === false) {
      return { create: [], delete: [], modify: [] }
    } else {
      return {
        create: !ap.create ? [] : ap.create,
        delete: !ap.delete ? [] : ap.delete,
        modify: !ap.modify ? [] : ap.modify
      }
    }
  }

  /**
   * Given a list of what has been added, removed, and modified, what should you undo based on your ruleset?
   * @param {APRules} ruleset
   * @param {Changelog} changed
   * @return {RuleParam} - Lists of what to undo.
   */
  static deliberate ({ allow, prevent }, { added = [], removed = [], modified = [] }) {
    const check = (type, items) => {
      const a = allow[type]
      const p = prevent[type]
      return items.filter((item) => {
        if (p === true && a === true) { // This is a conflict. Let's just allow it to happen
          return false
        } else if (p === true && a !== true) { // Prevent everything with exceptions
          return !a.includes(item)
        } else if (p !== true && a === true) { // Allow everything with exceptions
          return p.includes(item)
        } else { // Allow and prevent certain things
          return p.includes(item) && !a.includes(item) // Possibility for conflict if in both lists. Allows it to happen
        }
      })
    }
    return {
      create: check('create', added),
      delete: check('delete', removed),
      modify: check('modify', modified)
    }
  }
}

export default Referee
