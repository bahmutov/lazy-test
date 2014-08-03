# lazy-test

> Async one by one unit testing for interleaving production and test code

Properly written JavaScript is hard to test because most of the code
is hidden inside closures. For example, we cannot directly test
the inner function `isNumber` in this example:

```js
var add = (function () {
  function isNumber(x) {
    return typeof x === 'number';
  }

  return function add(a, b) {
    if (isNumber(a) &&
      isNumber(b))
      return a + b;
    return 'arguments should be numbers';
  };
}());
```

We can maybe move `isNumber` to another library, but often our logic is too specific.
We are left with testing `isNumber` indirectly via `add` or by playing various tricks
to relax the access rules. We could make inner functions used by a constructor function
by [inspecting the constructor's source](http://www.htmlgoodies.com/html5/javascript/accessing-private-functions-in-javascript-nested-functions.html). The solution is ugly and brittle.

## Inject tester into production

Instead of exporting inner functions to make them callable from unit tests, I am
proposing the opposite. Inject unit testing framework into your production code, but schedule
unit tests in the ways that prevent slowing down the user.

Same example code can use `lazyTest` object and add a couple of unit tests right in the production
code. I am using [lazy-ass](https://github.com/bahmutov/lazy-ass) assertions.

```js
// include lazy-test.js
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
    if (isNumber(a) &&
      isNumber(b))
      return a + b;
    return 'arguments should be numbers';
  };
}());

console.log(add(2, 3));
console.log(add('foo', 'bar'));

lazyTest.options.debug = true; // see test messages
// start tests after 1 second, run tests with 100 ms intervals
lazyTest.start(1000, 100);
```

This example will load the production code and will schedule first test to run after 1000ms.
When the first test finishes, it will schedule second test, again to be run after 100ms.
By default, nothing will be printed to the browser console, so we enabled debug output to
generate the following output

    5
    arguments should be numbers
    1015 scheduling test false delay 100
    1117 test "returns true for numbers" passed
    1117 scheduling test false delay 100
    1219 test "returns false for strings" passed
    1219 scheduling test false delay 100

## Reporting

You can set your own reporting functions:

    lazyTest.options.reporters.pass = fn(msg) ...
    lazyTest.options.reporters.fail = fn(err, msg) ...

Default fail reporter will just print the message to the browser console (if available).
I recommend using Sentry [Raven.captureError](http://raven-js.readthedocs.org/en/latest/usage/#how-to-actually-capture-an-error-correctly)

```js
lazyTest.options.reporters.pass = fn() {}; // no op for success
lazyTest.options.reporters.fail = Raven.captureException;
```

This way, we treat unit tests the same way as any defensive code. Testing in the wild
will find lots of interesting real world failures, see my
[blog posts](http://bahmutov.calepin.co/tag/sentry.html) about Sentry exception reporting.

## Start tests and timing

You must execute `lazyTest.start` at least once. There are two arguments: initial test delay,
and interval between tests.

    lazyTest.start(initialDelayMs, betweenTestsMs);

Each test will run after at least `betweenTestsMs` after previous test has finished.
Because the tests are scheduled one by one, the testing code will interleave with the production
code. It is up to you to make sure each individual unit test is short.

### Small print

Author: Gleb Bahmutov &copy; 2014

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://bahmutov.calepin.co/)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, etc.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/lazy-test/issues?state=open) on Github

## MIT License

Copyright (c) 2014 Gleb Bahmutov

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
