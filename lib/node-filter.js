/**
 * Factory for node filters.
 * allows injection of additional custom filters
 * that the walker should consider when building the tree
 * @param  {Function} filterMiddlware - Filter function. Should return a boolean
 * @return {NodeFilter} Used by TreeWalker to either accept or reject a given from the tree
 */
export default filterMiddlware => (node) => {
  // Accept current node if no middleware is defined
  if (!filterMiddlware) return NodeFilter.FILTER_ACCEPT;

  // ..if node passes/fails the filter,
  // return NodeFilter response
  return filterMiddlware(node) ?
    NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
};
