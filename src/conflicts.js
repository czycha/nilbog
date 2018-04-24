import Referee from './referee'

/**
 * Checks if elements are equal or have possibly deep parent-child relationship.
 * @param {Element} el1
 * @param {Element} el2
 * @return {boolean}
 */
function elementsAreRelated (el1, el2) {
  return el1 === el2 || el1.contains(el2) || el2.contains(el1)
}

/**
 * List of observers, segmented by action type.
 */
class ObserverList {
  constructor () {
    /**
     * Observers
     * @member {Array<Observer>}
     */
    this.observers = []
  }

  /**
   * Add observer to list
   * @param {Observer} observer
   */
  add (observer) {
    this.observers.push(observer)
  }

  /**
   * Return conflicting observers.
   * @param {Observer} observer - Inquiring observer
   * @param {Element} node - HTML element being acted on
   * @return {Array<Observer>}
   */
  conflicts (observer, node) {
    return this.observers.filter((o) => {
      // console.log({
      //   uid: o.uid,
      //   same: !o.equals(observer),
      //   connected: o.connected,
      //   matches: o.matches(node),
      //   related: elementsAreRelated(o.parent, observer.parent)
      // })
      return !o.equals(observer) && o.connected && o.matches(node) && elementsAreRelated(o.parent, observer.parent)
    })
  }

  /**
   * Resolve conflicts if they exist
   * @param {Observer} observer - Inquiring observer
   * @param {Element} node - HTML element being acted on
   * @return {boolean} - If true, tells the observer to continue. False, tells it to stop.
   */
  resolve (observer, node) {
    const conflicts = this.conflicts(observer, node)
    if (conflicts.length === 0) return true
    return this.tiebreaker(observer, conflicts)
  }

  /**
   * Naive tiebreaker. Override in other ObserverLists if needed.
   * @param {Observer} observer - Inquiring observer
   * @param {Array<Observer>} conflicts - Conflicting observers
   * @return {boolean} - True if observer wins the tiebreaker, meaning it can act.
   */
  tiebreaker (observer, conflicts) {
    const uids = conflicts.map(({ uid }) => uid)
    uids.push(observer.uid)
    return uids.sort()[0] === observer.uid
  }
}

/**
 * ObserverList for preventCreate and preventDelete
 * @extends ObserverList
 */
class PreventObserverList extends ObserverList {
  /**
   * @param {string} error - Error message output to console
   */
  constructor (error) {
    super()
    /**
     * Error message to output to console on bad conflict
     * @member {string}
     */
    this.error = error
  }

  /**
   * Resolve conflicts if they exist. Prevents feedback look between creation and deletion.
   * @override
   * @param {Observer} observer - Inquiring observer
   * @param {Element} node - HTML element being acted on
   * @param {PreventObserverList} other - Antagonist list that will undo what this list undoes
   * @return {boolean} - If true, tells the observer to continue. False, tells it to stop.
   */
  resolve (observer, node, other) {
    let go = true
    const internalConflicts = this.conflicts(observer, node)
    if (internalConflicts.length > 0) {
      go = this.tiebreaker(observer, internalConflicts)
      if (!go) return false
    }
    const externalConflicts = other.conflicts(observer, node)
    if (externalConflicts.length > 0) {
      console.warn(this.error)
      go = false
    }
    return go
  }
}

/**
 * ObserverList for when it depends on a changelog (create, delete, modify)
 * @extends ObserverList
 */
class ChangelogObserverList extends ObserverList {
  /**
   * Resolve conflicts if they exist. Will resolve ties based on each change if necessary.
   * @override
   * @param {Observer} observer - Inquiring observer
   * @param {Element} node - HTML element being acted on
   * @param {RuleParam} undo - What to undo
   * @return {true|RuleParam} - If true, undo everything. Otherwise, only work on returned keys.
   */
  resolve (observer, node, undo) {
    const conflicts = this.conflicts(observer, node)
    if (conflicts.length === 0 || this.tiebreaker(observer, conflicts)) return true
    return this.lowLevelTiebreakers(undo, observer, conflicts)
  }

  /**
   * Tiebreakers for each thing to undo
   * @param {RuleParam} undo
   * @param {Observer} observer
   * @param {Array<Observer>} conflicts
   * @return {RuleParam}
   */
  lowLevelTiebreakers (undo, observer, conflicts) {
    const conflictList = { create: {}, delete: {}, modify: {} }
    const types = ['create', 'delete', 'modify']
    const changed = { added: undo.create, removed: undo.delete, modified: undo.modify }
    conflicts.forEach((conflict) => {
      const conflictRules = conflict.extras[0]
      const conflictUndo = Referee.deliberate(conflictRules, changed)
      types.forEach((type) => {
        conflictUndo[type].forEach((key) => {
          if (conflictList[type][key] === undefined) conflictList[type][key] = []
          conflictList[type][key].push(conflict)
        })
      })
    })
    const newUndo = { create: [], delete: [], modify: [] }
    types.forEach((type) => {
      newUndo[type] = undo[type].filter((key) => {
        return !conflictList[type][key] || this.tiebreaker(observer, conflictList[type][key])
      })
    })
    return newUndo
  }
}

/**
 * Helps resolve conflicts between observers watching the same actions on the same nodes, preventing feedback loops.
 */
class ConflictManager {
  /**
   * @param {boolean} [noop=false] - Don't do anything ever.
   */
  constructor (noop = false) {
    /**
     * Don't do anything ever
     * @member {boolean}
     */
    this.noop = noop
    if (!noop) {
      const preventMsg = 'Nilbog conflict: preventCreate and preventDelete targeting same node. No action taken.'

      /**
       * Observer lists segmented by actions
       * @member {Object<ObserverList>}
       */
      this.observers = {
        preventCreate: new PreventObserverList(preventMsg),
        preventDelete: new PreventObserverList(preventMsg),
        protectText: new ObserverList(),
        protectClasses: new ChangelogObserverList(),
        protectAttributes: new ChangelogObserverList()
      }
    }
  }

  /**
   * Add observer to observer list
   * @param {string} type - Type of action. For example, 'preventCreate'
   * @param {Observer} observer
   */
  register (type, observer) {
    if (!this.noop) this.observers[type].add(observer)
  }

  /**
   * Resolve any conflicts
   * @param {string} action - Action type attempted. For example, 'preventCreate'
   * @param {Observer} observer
   * @param {Element} node - Node being acted upon
   * @param {...*} extras - Any other pertinent info to be passed along.
   * @return {boolean} - Whether or not observer is clear to operate. If `this.noop` is `true`, always returns `true`.
   */
  resolve (action, observer, node, ...extras) {
    if (this.noop) return true
    const resolve = (...more) => this.observers[action].resolve(observer, node, ...more)
    switch (action) {
      case 'preventCreate':
        return resolve(this.observers['preventDelete'])
      case 'preventDelete':
        return resolve(this.observers['preventCreate'])
      default:
        return resolve(...extras)
    }
  }
}

export {
  ObserverList,
  ChangelogObserverList,
  PreventObserverList
}

export default ConflictManager
