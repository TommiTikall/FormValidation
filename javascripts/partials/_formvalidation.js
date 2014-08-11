var App = App || {};

/**
 * TODO
 * - Do not validate email if field is empty [CHECK]
 * - Fix last input field (required, minchars:2, number)
 *   - It is minchars that is overriding the numbers validation
 */


/**
 * Form validation
 */
App.FormValidation = (function() {
  'use strict';

  var validation,

      // Selectors for DOM elements
      selectors = {
        form : '.js-form',
        validateField : '[data-validation]',
        submitButton : '.js-submit'
      },

      // Class names to toggle with js
      classNames = {
        valid : 'valid',
        invalid : 'invalid'
      },

      validationTypes = {
        required : 'required',
        email : 'email',
        password: 'password',
        number: 'number',
        minchars: 'minchars',
        custom: 'custom'
      },

      // Group together fields that are text input fields
      stringInputFields = [
        'text',
        'password',
        'email',
        'number',
        'search'
      ],

      // Store cached references to DOM elements
      // that will be used over and over again
      dom = {};

  /**
   * Initialize function
   * @return {void}
   */
  function initialize() {
    // Set up DOM and cache references
    _setupDOM();

    // Add event listeners
    _addEventListeners();
  }

  /**
   * Set up DOM (create?) elements and cache references for future use
   * @return {void}
   */
  function _setupDOM() {
    dom.$body = $( document.body );

    // Form element(s)
    dom.$form = $( selectors.form );
    dom.$validateField = $( selectors.validateField, dom.$form );
    dom.$submitButton = $( selectors.submitButton );

    // Count fields that want validation
    console.log('I found ' + dom.$validateField.length + ' fields that want validation');
  }

  /**
   * Attach event listeners to DOM elements
   */
  function _addEventListeners() {
    // dom.$validateField.on( 'focus', _pitStop );
    dom.$validateField.on( 'blur', _pitStop );
    dom.$validateField.on( 'keyup', _pitStop );
    dom.$submitButton.on( 'click', _pitStop );
  }

  /**
   * Get the target field element from the event
   * determine the event type, and take action accordingly
   *
   * @param  {event} event
   * @return {void}
   */
  function _pitStop ( event ) {
    var $el = $( event.target ); // The form element in question

    _validate($el);

    // Get event type to determine what to do next
    // if ( event.type === 'keyup' ) {
    //   _validate($el);
    // }

    // if ( event.type === 'focus' ) {
    //   _validate($el);
    // }

    // if ( event.type === 'blur' ) {
    //   console.log(event.type);
    //   _validate($el);
    // }

    // if ( event.type === 'submit' ) {
    //   // Validate all fields in form
    //   console.log('submitting form');
    //   return false;
    // }
  }

  /**
   * Validate fields
   * @param  {jQuery element} $this
   * @param  {variable} validation
   * @return {variable} validation
   */
  function _validate($this, validation) {
    validation = true;

    var $type = $this.attr('type'), // Field type [text, password, email, ...]
        $validationType = $this.data('validation'), // Get types of validations for this field
        $value = $this.val(), // Field value
        $length = $value.length, // Field value length
        isSpaceOrEmpty = /^\s*$/, // Empty space or blank characters (not working yet)
        emailRegExp = /^[\wæøå.-0-9a-zA-Z.+_]+@[\wæøå.-0-9a-zA-Z.+_]+\.[\wæøå.a-zA-Z]{2,}$/i, // Email
        minCharsRegExp = /\bminchars:+\d/i, // Minimum chracters
        numberRegExp = /^[0-9]*$/, // Number
        // customRegExp = /\:'(.*?)'/; // Custom regular expression, get everything after : and between ''
        customRegExp = /\bcustom:'(.*?)'/i;


    // Check if field belongs to TEXT INPUT FIELDS group
    if ( stringInputFields.indexOf( $type ) !== -1 ) {

      /*
        Clear all validation classes if EMPTY
      */
      if ( $length === 0 ) {
        $this.removeClass(classNames.invalid);
        $.each( validationTypes, function(i, n){
          $this.removeClass(n);
        });
      }

      /*
        Check if field wants REQUIRED validation
      */
      if ( $validationType.indexOf( validationTypes.required ) !== -1 ) {

        if ( $length === 0 ) {
          $this.addClass(validationTypes.required);
          validation = false;
        } else {
          $this.removeClass(validationTypes.required);
        }
      }

      /*
        Check if field wants EMAIL validation
      */
      if ( $length !== 0 && $validationType.indexOf( validationTypes.email ) !== -1 ) {

        if ( emailRegExp.test( $value ) ) {
          $this.removeClass(validationTypes.email);
        } else {
          $this.addClass(validationTypes.email);
          validation = false;
        }
      }

      /*
        Check if field wants NUMBER validation
      */
      if ( $length !== 0 && $validationType.indexOf( validationTypes.number ) !== -1 ) {

        if ( numberRegExp.test( $value ) ) {
          $this.removeClass(validationTypes.number);
        } else {
          $this.addClass(validationTypes.number);
          validation = false;
        }
      }

      /*
        Check if field wants MINIMUM CHARACTERS validation
      */
      // console.log(validationTypes.minChars);
      if ( $length !== 0 && $validationType.indexOf( validationTypes.minchars ) !== -1 ) {

        // Get the number from validation string (minchars:number),
        // convert match from array to string, then remove the semi colon from string
        var minimumCharsToMatch = $validationType.match( minCharsRegExp ).toString();
        minimumCharsToMatch = parseInt(minimumCharsToMatch.replace('minchars:', ''), 10);

        // If value length is the same or bigger than minimumCharsToMatch
        if ( $length >= minimumCharsToMatch ) {
          $this.removeClass(validationTypes.minchars);
        } else {
          $this.addClass(validationTypes.minchars);
          validation = false;
        }
      }

      /*
        Check if field wants CUSTOM validation
        This should be a Regular Expression string between ''
      */
      if ( $length !== 0 && $validationType.indexOf( validationTypes.custom ) !== -1 ) {

        // Get the regular expression string from validation string (custom:'string'),
        // convert match from array to string, then remove the semi colon from string
        var customRegExpToMatch = $validationType.match( customRegExp ); // gets the custom regexp string
        customRegExpToMatch = new RegExp(customRegExpToMatch[1].replace('custom:', ''));

        // console.log(typeof customRegExpToMatch);
        console.log(typeof customRegExpToMatch, customRegExpToMatch, customRegExpToMatch.test( $value ));


        // If the field value matches the customRegExpToMatch
        if ( customRegExpToMatch.test( $value ) ) {
          $this.removeClass(validationTypes.custom);
        } else {
          $this.addClass(validationTypes.custom);
          validation = false;
        }
      }

      console.log('valid field: '+validation);

      // Is the field valid or invalid? Tell the good folks!
      if ( validation === false ) {
        $this.removeClass(classNames.valid);
        $this.addClass(classNames.invalid);
      } else if ( validation === true && $this.hasClass(classNames.invalid) ){
        $this.removeClass(classNames.invalid);
        $this.addClass(classNames.valid);
      }

    }

    // OLD CRAP
    // else if( $type === undefined && $value === "0" ) {
    //   $this.removeClass(classNames.valid);
    //   $this.addClass(classNames.invalid);
    //   validation = false;
    // }
    // else if( $type === 'checkbox' && $this.prop('checked') === false ) {
    //   $this.removeClass(classNames.valid);
    //   $this.addClass(classNames.invalid);
    //   validation = false;
    // }
    // else if( $type === 'email' && !emailRegExp.test( $value ) ) {
    //   $this.removeClass(classNames.valid);
    //   $this.addClass(classNames.invalid);
    //   validation = false;
    // }
    // REQUIRED CHECKBOX
    // else if( $this.prop('checked') && $this.hasClass('js-user-login') ) {
    //   $this.removeClass(classNames.valid);
    //   $this.addClass(classNames.invalid);
    //   validation = false;
    // }
    // else {
    //   // If all is valid, return validation
    //   $this.removeClass(classNames.invalid);
    //   $this.addClass(classNames.valid);
    //   validation = true;
    // }
  }

  ////////////////
  // Public API //
  ////////////////

  return {
    initialize: initialize
  };

})();
