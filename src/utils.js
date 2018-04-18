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
 * Handles list arguments.
 * @param {boolean|Array<string>|string} list
 * @return {false|Array<string>}
 */
function handleList (list) {
  if (list === true) {
    return false
  } else if ((typeof list) === 'string') {
    return [list]
  } else if (Array.isArray(list)) {
    return list
  } else {
    return []
  }
}

export {
  matches,
  handleList
}
