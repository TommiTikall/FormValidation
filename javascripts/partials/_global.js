var App = App || {};

/**
 * Global object for globally accessible methods and values
 * @return {Object} Collection of public methods and values
 */
App.Global = (function() {
  'use strict';

  var IS_TOUCH = !! ( 'ontouchstart' in window );

  ////////////////
  // Public API //
  ////////////////

  return {
    IS_TOUCH: IS_TOUCH
  };

})();
