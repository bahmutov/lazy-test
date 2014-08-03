(function (root) {
  'use strict';
  var queue = [];
  var testScheduled = false;

  var started = +(new Date());
  function log() {
    if (typeof console === 'object' &&
      typeof console.log === 'function') {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(String(new Date() - started));
      console.log.apply(console, args);
    }
  }

  // defer given function - just add it to the event queue
  function schedule(fn, delay) {
    if (arguments.length === 1) {
      delay = 0;
    }
    setTimeout(fn, delay);
  }

  function scheduleTest(delay) {
    if (!arguments.length) {
      delay = 0;
    }
    if (root.lazyTest.options.debug) {
      log('scheduling test', testScheduled, 'delay', delay);
    }
    if (testScheduled) {
      return;
    }

    if (queue.length) {
      schedule(function () {
        var firstTest = queue.shift();
        firstTest.fn();
      }, delay);
      testScheduled = true;
    }
  }

  function it(name, fn) {
    var testCallback = function () {
      if (root.lazyTest.options.verbose) {
        log('starting test', this.name);
      }

      testScheduled = false;
      try {
        fn();
        if (root.lazyTest.options.verbose) {
          log('test "' + this.name + '" passed');
        }
      } catch (err) {
        if (root.lazyTest.options.verbose) {
          log('test "' + this.name + '" failed');
          log(err.message);
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
