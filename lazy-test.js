(function (root) {
  'use strict';
  var queue = [];
  var testScheduled = false;

  // defer given function - just add it to the event queue
  function schedule(fn) {
    setTimeout(fn, 0);
  }

  function scheduleTest() {
    if (root.lazyTest.options.debug) {
      console.log('scheduling test', testScheduled);
    }
    if (testScheduled) {
      return;
    }

    if (queue.length) {
      schedule(function () {
        var firstTest = queue.shift();
        firstTest.fn();
      });
      testScheduled = true;
    }
  }

  function it(name, fn) {
    var testCallback = function () {
      if (root.lazyTest.options.verbose) {
        console.log('starting test', this.name);
      }

      testScheduled = false;
      try {
        fn();
        if (root.lazyTest.options.verbose) {
          console.log('test "' + this.name + '" passed');
        }
      } catch (err) {
        if (root.lazyTest.options.verbose) {
          console.log('test "' + this.name + '" failed');
          console.log(err.message);
        }
      }
      root.lazyTest.start();
    };
    var aTest = {
      name: name
    };
    aTest.fn = testCallback.bind(aTest);

    queue.push(aTest);
  }

  root.lt = root.lazyTest = {
    it: it,
    start: scheduleTest,
    options: {
      vebose: false,
      debug: false
    }
  };


}(typeof window === 'object' ? window : global));
