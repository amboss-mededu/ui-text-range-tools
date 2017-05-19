import createNodeFilter from './node-filter';


const {forEach} = Array.prototype;

/**
 * Returns the result of inserting string `b` into string `a` starting at position `i`
 *
 * @param {String} a
 * @param {Number} i
 * @param {String} b
 * @returns {String}
 * @private
 */
function _insert(a, i, b) {
  return a.substr(0, i) + b + a.substr(i);
}

/**
 * Removes this element and merges its text content with the adjacent text content,
 * or replaces itself with a TextNode if there is no adjacent text content.
 *
 * @param {Element} el
 * @private
 */
function _unwrap(el){

  let prevT = el.previousSibling && el.previousSibling.nodeType === Node.TEXT_NODE,
      nextT = el.nextSibling && el.nextSibling.nodeType === Node.TEXT_NODE;

  if(prevT && nextT){
    el.previousSibling.data += el.textContent + el.nextSibling.data;
    el.parentNode.removeChild(el.nextSibling);
    el.parentNode.removeChild(el);
  }else

  if(prevT){
    el.previousSibling.data += el.textContent;
    el.parentNode.removeChild(el);
  }else

  if(nextT){
    el.nextSibling.data = el.textContent + el.nextSibling.data;
    el.parentNode.removeChild(el);
  }

  else{
    el.parentNode.replaceChild(
      document.createTextNode(el.textContent),
      el
    );
  }

}

/**
 * Calls _unwrap on all created elements
 *
 * @param {Array} created - an array of HTML elements created during filter application
 * @private
 */
function _unwrapAll(created){
  forEach.call(created, _unwrap);
}

/**
 * Places start and end tags defining `filterEl` in `node`'s inner html at
 * positions in the HTML provided by the two filter point arrays, expressed as integer points in
 * the combined, unfiltered, untrimmed textNode data of `node`.
 *
 * @param {Element} scope
 * @param {Function} factory - generates elements to add to the DOM;
 * @param {Object} points
 * must always use the same `tagName`; data point at node passed as first argument; must accept `null` as argument.
 * @param {Array} points.starts - sorted array of points at which to insert start tags
 * @param {Array} points.data - array of data to give the factory; must be the same length as startPoints
 * @param {Array} points.ends - sorted array of points at which to insert end tags; must be the same length as startPoints
 */
export default (scope, factory, points, options = {}) => {

  const {starts, ends, data} = points,
        {tagName}            = factory(null);

  const p = document.createElement('i'),
        created = [];

  let t  = 0, // text cursor
      cs = 0, // start cursor
      ce = 0; // end cursor

  const walker = document.createTreeWalker( // the walker
    scope,
    NodeFilter.SHOW_TEXT, // only operate on text nodes
    {
      /**
       * Returns an unsigned short that will be used to tell
       * if a given Node must be accepted or not by the NodeIterator
       * or TreeWalker iteration algorithm.
       * see: https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter
       */
      acceptNode: createNodeFilter(options.filter)
    }, false
  );

  let n = walker.nextNode(); // node cursor

  while (n) {
    // n is the text node we're looking at

    let d = n.data;

    const l = n.data.length;

    for (let o = 0, i = 0; o <= l; o += 1) {

      // insert end tags unless we're at the beginning
      if (o > 0) {
        while (ends[ce] === t + o) {
          // add an end point here

          const tagEnd = `</${tagName}>`;

          d = _insert(d, i, tagEnd);
          i += tagEnd.length;
          ce += 1;

        }
      }

      // insert start tags unless we're at the end
      if (o < l) {
        while (starts[cs] === t + o) {
          // add a start point here

          const tag      = factory(data[cs]),
                tagAll   = tag.outerHTML,
                tagEnd   = tagAll.substr(tagAll.length - (3 + tag.tagName.length)),
                tagStart = tagAll.substr(0, tagAll.length - tagEnd.length);

          d = _insert(d, i, tagStart);
          i += tagStart.length;
          cs += 1;

        }
      }

      i += 1;

    }

    const next = walker.nextNode();

    // commit changes after moving on

    p.innerHTML = d;

    let c = p.childNodes[p.childNodes.length - 1];

    if(c.nodeType === Node.ELEMENT_NODE) created.push(c);

    n.parentNode.replaceChild(c, n);

    for (let cc = p.childNodes.length - 1; cc >= 0; cc -= 1) {
      let ccc = p.childNodes[p.childNodes.length - 1];
      if(ccc.nodeType === Node.ELEMENT_NODE) created.push(ccc);
      c = c.parentNode.insertBefore(ccc, c);
    }

    // move on

    n = next;
    t += l;

  }

  return function(){ _unwrapAll(created) }

};
