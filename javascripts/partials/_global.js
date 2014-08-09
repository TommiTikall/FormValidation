var App = App || {};

/**
 * Global object for globally accessible methods and values
 * @return {Object} Collection of public methods and values
 */
App.Global = (function() {
  'use strict';

  var IS_TOUCH = !! ( 'ontouchstart' in window ),

  dom = {};

  function initialize() {
    // Set up DOM and cache references
    _setupDOM();

    _touchDom();
  }

  /**
   * Set up DOM (create?) elements and cache references for future use
   * @return {void}
   */
  function _setupDOM() {
    dom.$html = $( 'html' );
    dom.$body = $( document.body );
  }

  function _touchDom() {
    if ( IS_TOUCH ) {
      dom.$html.addClass('touch');
    } else {
      dom.$html.addClass('no-touch');
    }
  }

  ////////////////
  // Public API //
  ////////////////

  return {
    initialize: initialize,
    IS_TOUCH: IS_TOUCH
  };

})();
