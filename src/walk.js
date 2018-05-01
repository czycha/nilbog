/**
 * Adapted from {@link https://github.com/npm-dom/dom-walk}
 * @param {Element|Array<Element>} nodes
 * @param {function} cb - Callback function. Takes current node as argument. Use return to prevent recursion into current node.
 */
function walk (nodes, cb) {
  const slice = Array.prototype.slice
  if (!('length' in nodes)) nodes = [nodes]
  nodes = slice.call(nodes)
  while (nodes.length) {
    const node = nodes.shift()
    if(!node) continue
    const ret = cb(node)
    if (ret === undefined && node.childNodes && node.childNodes.length) {
      nodes = slice.call(node.childNodes).concat(nodes)
    }
  }
}

export default walk
