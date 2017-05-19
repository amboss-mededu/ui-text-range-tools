// Helpers
// -------

/**
 * Element.matches polyfill
 */
var matches = function(node, s) {
  var matches = (node.document || node.ownerDocument).querySelectorAll(s),
      i = matches.length;
  while (--i >= 0 && matches.item(i) !== node) {}
  return i > -1;
};


/**
 * DOM tree climber for a selector
 */
var getParents = function (elem, selector) {
  // Setup parents array
  var parents = [];

  // Get matching parent elements
  for (; elem && elem !== document; elem = elem.parentNode) {

    // Add matching parents to array
    if (selector) {
      if (matches(elem, selector)) {
        parents.push(elem);
      }
    } else {
      parents.push(elem);
    }
  }

  return parents;
};

chai.should();

var expect = chai.expect;

var find = textRangeTools.find,
    applyFilter = textRangeTools.applyFilter;

const testInner = '<p>A gay musical, called Gay. That’s quite gay. Gay musical? Aren’t all musicals gay? This must be, like, the gayest musical ever. I’m a 32 year old <abbr title="information technology">IT</abbr>-man who works in a basement. Yes, I do the whole Lonely Hearts thing! Unbelievable! Some idiot disabled his firewall, meaning all the computers on seven are teeming with viruses, plus I’ve just had to walk all the way down the motherfudging stairs, because the lifts are broken AGAIN! I’ll put this over here, with the rest of the fire. No, no, that’s the music you heard when it come on. It’s like they’re pally-wally with us when there’s a problem with their printer, but once it’s fixed...</p>';

describe('filter', function() {

  var scope;

  var factory = function(data){
    var el = document.createElement('span');
    if(data != null) el.setAttribute('data-data', data);
    return el;
  };

  before(function () {

    scope = document.createElement('div');

    document.body.appendChild(scope);

  });

  beforeEach(function(){

    scope.innerHTML = testInner;

  });

  it('should apply correctly to whole results', function(){

    var mf = find(scope, 'motherfudging');

    applyFilter(scope, factory, mf);

    var resultTags = scope.querySelectorAll('span[data-data]');

    expect(resultTags.length).to.equal(1);

  });

  it('should apply correctly across tags', function(){

    var mf = find(scope, 'old it-man');

    applyFilter(scope, factory, mf);

    var resultTags = scope.querySelectorAll('span[data-data]');

    expect(resultTags.length).to.equal(3);

    expect(resultTags[0].getAttribute('data-data')).to.equal('0');
    expect(resultTags[1].getAttribute('data-data')).to.equal('0');
    expect(resultTags[2].getAttribute('data-data')).to.equal('0');

  });

  it('should be able to revert the changes it makes', function(){

    var mf = find(scope, 'old it-man');

    var revert = applyFilter(scope, factory, mf);

    var resultTags = scope.querySelectorAll('span[data-data]');
    expect(resultTags.length).to.equal(3);

    revert();

    resultTags = scope.querySelectorAll('span[data-data]');
    expect(resultTags.length).to.equal(0);

    expect(scope.innerHTML).to.equal(testInner);

  });

  it('should support additional filter option', function() {
    var called = false;

    var filterNode = function(node) {
      called = true;
    };

    var opts = { filter: filterNode };

    applyFilter(scope, factory, find(scope, 'old IT'), opts);

    expect(called).to.equal(true);
  });

  it('should accept nodes matching the filter', function() {
    var contents = document.createElement('div');

    document.body.innerHTML = '';

    contents.innerHTML = '<article>' +
      '<div><p>A gay musical, called Gay. That’s quite gay. </p></div>' +
      '<section><p>Gay musical? Aren’t all musicals gay?</p></section>' +
    '</article>';

    document.body.appendChild(contents);

    var called = false;
    var withinSection;

    var filterNode = (node) => {
      called = true;
      withinSection = getParents(node, 'section');

      expect(node).to.have.property('nodeType');
      expect(node.nodeType).to.equal(node.TEXT_NODE);

      return Boolean(withinSection.length);
    };

    const opts = { filter: filterNode };

    var searchTerm = 'musical';
    var r = find(contents, searchTerm, opts);
    applyFilter(contents, factory, r, opts);

    var n = [].slice.call(contents.querySelectorAll('span[data-data]'));
    var n1 = n[0];

    expect(called).to.equal(true);
    expect(r.starts.length).to.equal(2);
    expect(r.ends.length).to.equal(2);
    expect(r.data.length).to.equal(2);
    expect(r.results).to.equal(2);
    expect(n.length).to.equal(2);
    expect(n1.innerText).to.equal(searchTerm);
  });
});
