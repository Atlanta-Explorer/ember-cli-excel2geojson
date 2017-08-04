/* globals define, XLSX */

(function() {

  function generateModule(name, values) {
    define(name, [], function() {
      'use strict';

      return values;
    });
  }

  generateModule('js-xlsx', { 'default': XLSX });
})();
