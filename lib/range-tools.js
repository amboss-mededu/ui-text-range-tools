import climb from 'climb-es6';

/**
 * Take a range and returns start and end positions in the text for that range.
 *
 * @param scope
 * @param range
 * @returns {*[]}
 */
const rangeToPair = function (scope, range) {

  if (!(
      range.commonAncestorContainer === scope ||
      climb(
        range.commonAncestorContainer,
        el => el === scope,
        scope.parentNode
      )
    )) {
    return null;
  }

  const startIsEl = range.startContainer.nodeType === Node.ELEMENT_NODE,
        endIsEl   = range.endContainer.nodeType === Node.ELEMENT_NODE;

  let t = 0,
      n; // the cursor

  const walker = document.createTreeWalker( // the walker
    scope,
    NodeFilter.SHOW_TEXT + (
      startIsEl || endIsEl ? NodeFilter.SHOW_ELEMENT : 0
    ),
    null, false
  );

  let start,
      end;

  while (n = walker.nextNode()) {

    if (n === range.startContainer) {
      start = t + range.startOffset;
    }

    if (n === range.endContainer) {
      end = t + range.endOffset;
      break;
    }

    t += n.nodeType === Node.TEXT_NODE ? n.data.length : 0;

  }

  return [start, end];

};

/**
 * Creates a new Range object from start and end coordinates within a scope element. Returns null if an appropriate
 * range cannot be created.
 *
 * @param scope
 * @param pair
 */
const rangeFromPair = function (scope, pair) {

  const range = document.createRange();

  let startSet = false,
      endSet   = false;

  let t = 0,
      n; // the cursor

  const walker = document.createTreeWalker( // the walker
    scope,
    NodeFilter.SHOW_TEXT,
    null, false
  );

  const start = pair[0],
      end   = pair[1];

  let l = 0;

  while (n = walker.nextNode()) {

    l = n.data.length;

    if (!startSet && (start >= t && start < t + l)) {
      range.setStart(n, start - t);
      startSet = true;
    }

    if (!endSet && (end >= t && end < t + l)) {
      range.setEnd(n, end - t);
      endSet = true;
    }

    if (startSet && endSet) {
      break;
    }

    t += l;

  }

  return (startSet && endSet) ? range : null;

};

function _byOffset(a, b) {
  return a.offset - b.offset;
}

/**
 * Returns filter points suitable for applying a markup filter given a set of tuples.
 * Data is populated with a list of tuples indices
 *
 * @param {Element} scope
 * @param {Array} pairs
 * @returns {Object}
 */
const filterPointsFromPairs = function (scope, pairs) {

  const starts = [],
        ends   = [],
        data   = [];

  let t = 0,
      n; // the cursor

  const walker = document.createTreeWalker( // the walker
    scope,
    NodeFilter.SHOW_TEXT,
    null, false
  );

  const mapStarts = [],
        mapEnds   = [];

  pairs.forEach((sae, s) => {
    mapStarts.push({
      offset: sae[0],
      data: s
    });
    mapEnds.push({
      offset: sae[1],
      data: s
    });
  });

  mapStarts.sort(_byOffset);
  mapEnds.sort(_byOffset);

  let ms = 0,
      me = 0,
      l = 0;

  const inRanges = new Set();

  while (n = walker.nextNode()) {

    l = n.data.length;

    // first, start any ranges that begin at this point

    while (mapStarts[ms] && mapStarts[ms].offset === t) {
      inRanges.add(mapStarts[ms].data);
      ms += 1;
    }

    if (inRanges.size) {
      starts.push(t);
      data.push([...inRanges]);
    }

    let tt = Math.min(
      mapStarts[ms] ? mapStarts[ms].offset : Infinity,
      mapEnds[me] ? mapEnds[me].offset : Infinity
    );

    while (tt < t + l) {

      let added,
          removed;

      const startSize = inRanges.size;

      while (mapStarts[ms] && mapStarts[ms].offset === tt) {
        inRanges.add(mapStarts[ms].data);
        ms += 1;
        added = true;
      }

      while (mapEnds[me] && mapEnds[me].offset === tt) {
        inRanges.delete(mapEnds[me].data);
        me += 1;
        removed = true;
      }

      if (added || (removed && inRanges.size > 0)) {
        starts.push(tt);
        data.push([...inRanges]);
      }

      if (removed || (added && startSize > 0)) {
        ends.push(tt);
      }

      tt = Math.min(
        mapStarts[ms] ? mapStarts[ms].offset : Infinity,
        mapEnds[me] ? mapEnds[me].offset : Infinity
      );

    }

    if (inRanges.size) {
      ends.push(t + l);
    }

    t += l;

  }

  return {
    starts,
    data,
    ends
  };

};

export {
  rangeToPair,
  rangeFromPair,
  filterPointsFromPairs
};
