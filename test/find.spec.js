chai.should();

var expect = chai.expect;

var find = textRangeTools.find,
    scope = document.getElementById('find-spec');

describe('find', function(){

  var scope;

  before(function(){

    scope = document.createElement('div');

    scope.innerHTML = '<p>A gay musical, called Gay. That’s quite gay. Gay musical? Aren’t all musicals gay? This must be, like, the gayest musical ever. I’m a 32 year old <abbr title="information technology">IT</abbr>-man who works in a basement. Yes, I do the whole Lonely Hearts thing! Unbelievable! Some idiot disabled his firewall, meaning all the computers on seven are teeming with viruses, plus I’ve just had to walk all the way down the motherfudging stairs, because the lifts are broken AGAIN! I’ll put this over here, with the rest of the fire. No, no, that’s the music you heard when it come on. It’s like they’re pally-wally with us when there’s a problem with their printer, but once it’s fixed...</p>';

    document.body.appendChild(scope);

  });

  it('should find whole results in text nodes', function(){

    var r0 = find(scope, 'gay');

    expect(r0.starts.length).to.equal(6);
    expect(r0.ends.length).to.equal(6);
    expect(r0.data.length).to.equal(6);
    expect(r0.results).to.equal(6);

  });

  it('should find results across text nodes', function(){

    var r1 = find(scope, 'old IT'),
        r2 = find(scope, 'IT-man'),
        r3 = find(scope, 'old IT-man');

    expect(r1.starts.length).to.equal(2);
    expect(r1.results).to.equal(1);

    expect(r2.starts.length).to.equal(2);
    expect(r2.results).to.equal(1);

    expect(r3.starts.length).to.equal(3);
    expect(r3.results).to.equal(1);

    expect(r1.starts[0]).to.equal(r3.starts[0]);
    expect(r2.ends[1]).to.equal(r3.ends[2]);

  });

});