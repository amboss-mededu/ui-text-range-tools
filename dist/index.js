module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.applyFilter = exports.find = undefined;

	var _find = __webpack_require__(1);

	var _find2 = _interopRequireDefault(_find);

	var _applyFilter = __webpack_require__(2);

	var _applyFilter2 = _interopRequireDefault(_applyFilter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.find = _find2.default;
	exports.applyFilter = _applyFilter2.default;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Searches in the text content of a scope node for matches.
	 * Returns start, end, and data points for building a filter for find results, as well as analytics about the search.
	 *
	 * @param {Element} scope
	 * @param {String} query
	 * @returns {Object} start, end, and data points suitable for a filter, also `results`, the number of hits found
	 */

	var _Array$prototype = Array.prototype,
	    reduce = _Array$prototype.reduce,
	    splice = _Array$prototype.splice;

	// memory optimization: cache

	var EXEC_RESULT = void 0;

	exports.default = function (scope, q) {

	  var timeStart = performance.now();

	  // Must have good query

	  if (!(q && q.length > 0)) return null;

	  var query = q.toLowerCase();

	  // Compile regular expressions

	  var wholePattern = new RegExp(query, 'gim');

	  var startPattern = new RegExp(reduce.call(query, function (mem, char, c) {
	    return c === 0 ? mem : mem + ('|' + query.substring(0, query.length - c) + '$');
	  }, '').substr(1), 'i');

	  // prepare pending buffers

	  var pendingOffset = 0;

	  var pendingStarts = [],
	      pendingEnds = [],
	      pendingData = [];

	  // Prepare the filter points

	  var starts = [],
	      ends = [],
	      data = [];

	  // Walk through the scope, gathering filter points

	  var t = 0,
	      d = 0,
	      // data
	  n = void 0;

	  var walker = document.createTreeWalker( // the walker
	  scope, NodeFilter.SHOW_TEXT, // only operate on text nodes
	  null, false);

	  while (n = walker.nextNode()) {

	    // Follow-up on any pending match

	    if (pendingStarts.length) {

	      var p0 = pendingOffset;

	      // first check if the match holds
	      for (var c = 0; c < Math.min(query.length - p0, n.data.length); c += 1) {
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

	  var timeEnd = performance.now();

	  console.log('[Find]', 'performance', timeEnd - timeStart, 'ms');

	  return {
	    starts: starts,
	    ends: ends,
	    data: data,
	    results: d
	  };
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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

	exports.default = function (scope, factory, points) {
	  var starts = points.starts,
	      ends = points.ends,
	      data = points.data,
	      _factory = factory(null),
	      tagName = _factory.tagName;

	  var timeStart = performance.now();

	  var p = document.createElement('i');

	  var t = 0,
	      // text cursor
	  cs = 0,
	      // start cursor
	  ce = 0; // end cursor

	  var walker = document.createTreeWalker( // the walker
	  scope, NodeFilter.SHOW_TEXT, // only operate on text nodes
	  null, false);

	  var n = walker.nextNode(); // node cursor

	  while (n) {
	    // n is the text node we're looking at

	    var d = n.data;

	    var l = n.data.length;

	    for (var o = 0, i = 0; o <= l; o += 1) {

	      // insert end tags unless we're at the beginning
	      if (o > 0) {
	        while (ends[ce] === t + o) {
	          // add an end point here

	          var tagEnd = '</' + tagName + '>';

	          d = _insert(d, i, tagEnd);
	          i += tagEnd.length;
	          ce += 1;
	        }
	      }

	      // insert start tags unless we're at the end
	      if (o < l) {
	        while (starts[cs] === t + o) {
	          // add a start point here

	          var tag = factory(data[cs]),
	              tagAll = tag.outerHTML,
	              _tagEnd = tagAll.substr(tagAll.length - (3 + tag.tagName.length)),
	              tagStart = tagAll.substr(0, tagAll.length - _tagEnd.length);

	          d = _insert(d, i, tagStart);
	          i += tagStart.length;
	          cs += 1;
	        }
	      }

	      i += 1;
	    }

	    var next = walker.nextNode();

	    // commit changes after moving on

	    // if(d !== n.data) debugger;

	    p.innerHTML = d;

	    var c = p.childNodes[p.childNodes.length - 1];

	    n.parentNode.replaceChild(c, n);

	    for (var cc = p.childNodes.length - 1; cc >= 0; cc -= 1) {
	      c = c.parentNode.insertBefore(p.childNodes[p.childNodes.length - 1], c);
	    }

	    // move on

	    n = next;
	    t += l;
	  }

	  var timeEnd = performance.now();

	  console.log('[Apply filter]', 'performance', timeEnd - timeStart, 'ms');
	};

/***/ }
/******/ ]);