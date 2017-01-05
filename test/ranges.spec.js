chai.should();

var expect = chai.expect;

var applyFilter           = textRangeTools.applyFilter,
    rangeToPair           = textRangeTools.rangeToPair,
    rangeFromPair         = textRangeTools.rangeFromPair,
    filterPointsFromPairs = textRangeTools.filterPointsFromPairs;

function _concatReducer(memo, el) {
  memo += el.textContent;
  return memo;
}

describe('range tools', function () {

  var scope;

  beforeEach(function () {

    scope = document.createElement('div');

    scope.innerHTML = '<p>A gay <span>musical</span>, called Gay. That’s quite gay. Gay musical? Aren’t all musicals gay? This must be, like, the gayest musical ever. I’m a 32 year old <abbr title="information technology">IT</abbr>-man who works in a basement. Yes, I do the whole Lonely Hearts thing! Unbelievable! Some idiot disabled his firewall, meaning all the computers on seven are teeming with viruses, plus I’ve just had to walk all the way down the motherfudging stairs, because the lifts are broken AGAIN! I’ll put this over here, with the rest of the fire. No, no, that’s the music you heard when it come on. It’s like they’re pally-wally with us when there’s a problem with their printer, but once it’s fixed...</p>';

    document.body.appendChild(scope);

  });

  afterEach(function () {

    document.body.removeChild(scope);

  });

  describe('range to pair', function () {

    var range = document.createRange();

    it('should create an accurate pair regardless of element boundaries', function () {

      range.setStart(scope.children[0].childNodes[0], 2);
      range.setEnd(scope.children[0].children[0].childNodes[0], 5);

      // This range should select 'gay music'

      var pair = rangeToPair(scope, range);

      expect(pair[0]).to.equal(2);
      expect(pair[1]).to.equal(11);

    });

  });

  describe('range from pair', function () {

    var pair = [2, 11],
        range;

    it('should create an accurage range from a pair that crosses element boundaries', function () {

      range = rangeFromPair(scope, pair);

      expect(range.startContainer).to.equal(scope.children[0].childNodes[0]);
      expect(range.endContainer).to.equal(scope.children[0].children[0].childNodes[0]);

    });

  });

  describe('filter-points from pairs', function () {

    var pairs = [
      [2, 11], // 'gay music'
      [6, 19] // 'musical, call'
    ];

    it('should create appropriate filter points from a set of ranges', function () {

      var points = filterPointsFromPairs(scope, pairs);

      applyFilter(scope, function (data) {
        var el = document.createElement('span');
        if (data && data.length) el.setAttribute('data-pairs', data.join(' '));
        return el;
      }, points);

      var firstPairEls  = scope.querySelectorAll('span[data-pairs~="0"]'),
          secondPairEls = scope.querySelectorAll('span[data-pairs~="1"]');

      var firstPairSum  = Array.prototype.reduce.call(
            firstPairEls,
            _concatReducer,
            ''
          ),
          secondPairSum = Array.prototype.reduce.call(
            secondPairEls,
            _concatReducer,
            ''
          );

      expect(firstPairEls[1]).to.equal(secondPairEls[0]);
      expect(firstPairSum).to.equal('gay music');
      expect(secondPairSum).to.equal('musical, call');

    });

  });

});