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

});