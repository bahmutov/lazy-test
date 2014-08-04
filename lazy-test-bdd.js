/* global window, global */
(function (root) {
  'use strict';

  if (typeof root.it === 'function') {
    root.lt = root.lazyTest = {
      it: root.it,
      start: function () {},
      options: {
        reporters: {}
      }
    };
  }
}(typeof window === 'object' ? window : global));
