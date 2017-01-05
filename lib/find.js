/**
 * Searches in the text content of a scope node for matches.
 * Returns start, end, and data points for building a filter for find results, as well as analytics about the search.
 *
 * @param {Element} scope
 * @param {String} query
 * @returns {Object} start, end, and data points suitable for a filter, also `results`, the number of hits found
 */

const {reduce, splice} = Array.prototype;

// memory optimization: cache
let EXEC_RESULT;

export default (scope, q) => {

  const timeStart = performance.now();

  // Must have good query

  if (!(q && q.length > 0)) return null;

  const query = q.toLowerCase();

  // Compile regular expressions

  const wholePattern = new RegExp(query, 'gim');

  const startPattern = new RegExp(
    reduce.call(
      query,
      (mem, char, c) => {
        return c === 0 ? mem : mem + `|${query.substring(0, query.length - c)}$`;
      }, ''
    ).substr(1),
    'i'
  );

  // prepare pending buffers

  let pendingOffset = 0;

  const pendingStarts = [],
        pendingEnds   = [],
        pendingData   = [];

  // Prepare the filter points

  const starts = [],
        ends   = [],
        data   = [];

  // Walk through the scope, gathering filter points

  let t = 0,
      d = 0, // data
      n;

  const walker = document.createTreeWalker( // the walker
    scope,
    NodeFilter.SHOW_TEXT, // only operate on text nodes
    null, false
  );

  while (n = walker.nextNode()) {

    // Follow-up on any pending match

    if (pendingStarts.length) {

      const p0 = pendingOffset;

      // first check if the match holds
      for (let c = 0; c < Math.min(query.length - p0, n.data.length); c += 1) {
        if (n.data[c].toLowerCase() !== query[c + p0]) {
          pendingStarts.length = 0;
          pendingEnds.length = 0;
          pendingData.length = 0;
          break;
        } else {
          pendingOffset += 1;
        }
      }

      // then, if it held, record start and end positions for this node
      if (pendingStarts.length) {
        pendingStarts.push(t);
        pendingData.push(d);
        pendingEnds.push(t + (pendingOffset - p0));
      }

      // if we're at the end of the match, commit pending points and clear them
      if (pendingOffset >= query.length) {

        pendingStarts.unshift(starts.length, 0);
        pendingEnds.unshift(ends.length, 0);
        pendingData.unshift(data.length, 0);

        splice.apply(starts, pendingStarts);
        splice.apply(ends, pendingEnds);
        splice.apply(data, pendingData);

        pendingStarts.length = 0;
        pendingEnds.length = 0;
        pendingData.length = 0;

        d += 1;

      }

    }

    // Check for whole matches

    if (n.data.length >= query.length) {
      // check for and gather entire matches
      while ((EXEC_RESULT = wholePattern.exec(n.data)) !== null) {
        starts.push(t + EXEC_RESULT.index);
        ends.push(t + EXEC_RESULT.index + query.length);
        data.push(d);
        d += 1;
      }
      wholePattern.lastIndex = 0; // reset `wholePattern` so it can be used later
    }

    // Check for the beginning of a partial match

    if (!pendingStarts.length && (EXEC_RESULT = startPattern.exec(n.data)) !== null) {
      pendingStarts.push(t + EXEC_RESULT.index);
      pendingEnds.push(t + EXEC_RESULT.index + EXEC_RESULT[0].length);
      pendingData.push(d);
      pendingOffset = EXEC_RESULT[0].length;
    }

    t += n.data.length;

  }

  const timeEnd = performance.now();

  console.log('[Find]', 'performance', timeEnd - timeStart, 'ms');

  return {
    starts,
    ends,
    data,
    results: d
  };

};
