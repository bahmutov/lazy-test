if (typeof require === 'function') {
  require('../lazy-test');
  require('lazy-ass');
}

/* global lazyTest */
var add = (function () {
  function isNumber(x) {
    return typeof x === 'number';
  }

  lazyTest.it('returns true for numbers', function () {
    lazyAss(isNumber(1), '1');
    lazyAss(isNumber(-10), '-10');
  });

  lazyTest.it('returns false for strings', function () {
    lazyAss(!isNumber('foo'), 'foo');
    lazyAss(!isNumber('2'), '2');
  });

  return function add(a, b) {
    if (isNumber(a) && isNumber(b)) {
      return a + b;
    }
    return 'arguments should be numbers';
  };
}());

console.log(add(2, 3));
console.log(add('foo', 'bar'));

// start tests after 1 second, run tests with 100 ms intervals
lazyTest.options.debug = true;
lazyTest.start(1000, 100);
