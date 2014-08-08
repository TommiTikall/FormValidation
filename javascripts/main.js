// Import plugins
// @codekit-prepend "lib/prettifyjs/prettify.js";

// Import utilities
// @codekit-prepend "utils/_debug-log.js";

// Import partials
// @codekit-prepend "partials/_formvalidation.js";

var App = App || {};

$(document).ready(function() {

  // Init form validation
	App.FormValidation.initialize();

  // Init prettify.js
  prettyPrint();
});
