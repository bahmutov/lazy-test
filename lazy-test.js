/* global window, global */
(function (root) {
  'use strict';
  var queue = [];
  var testScheduled = false;
  var betweenTests = 0; // ms

  var started = +(new Date());
  function log() {
    if (typeof console === 'object' &&
      typeof console.log === 'function') {
      var args = Array.prototype.slice.call(arguments, 0);
      args.unshift(String(new Date() - started));
      console.log.apply(console, args);
    }
  }

  function logException(err, msg) {
    log(msg);
  }

  function noop() {}

  // defer given function - just add it to the event queue
  function schedule(fn, delay) {
    if (arguments.length === 1) {
      delay = 0;
    }
    setTimeout(fn, delay);
  }

  function scheduleTest(delay) {
    if (!arguments.length) {
      delay = betweenTests;
    } else {
      betweenTests = delay;
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
      }, betweenTests);
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
        root.lazyTest.options.reporters.pass('test "' + this.name + '" passed');
      } catch (err) {
        var msg = 'test "' + this.name + '" failed\n' + err.message;
        if (err.stack) {
          msg += '\n' + err.stack;
        }
        root.lazyTest.options.reporters.fail(err, msg);
      }
      scheduleTest();
    };
    var aTest = {
      name: name
    };
    aTest.fn = testCallback.bind(aTest);

    queue.push(aTest);
  }

  root.lt = root.lazyTest = {
    it: it,
    start: function (initialDelay, testDelay) {
      if (!arguments.length) {
        return scheduleTest(betweenTests);
      }
      if (arguments.length === 1) {
        return scheduleTest(initialDelay);
      }
      setTimeout(function () {
        return scheduleTest(testDelay);
      }, initialDelay);
    },
    disable: function () {
      log('disabling lazy-test');
      this.it = this.start = noop;
    },
    options: {
      vebose: false,
      debug: false,
      reporters: {
        fail: logException,
        pass: log
      }
    }
  };

}(typeof window === 'object' ? window : global));
