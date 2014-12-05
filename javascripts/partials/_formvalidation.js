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
      debug = true, // Set to true to debug the validation process
      debugFieldValidationArray = [], // Array that will contain the id of fields that fail validation. "debug" must be set to true for this to work

      validationSettings = {
        onBlur: true, // Only if field is invalid or valid
        onFocus: false, // Only if field is invalid or valid
        onKeyUp: true, // Only if field is invalid or valid
        onSubmit: true,
        showInlineValidation: true,
        showValidationSummary: false
      },

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
        custom: 'custom',
        equalto: 'equalto'
      },

      // Group together fields that are text input fields
      // This is to easily match input types when looping through validation
      stringInputFields = [
        'text',
        'password',
        'email',
        'number',
        'search'
      ],

      // Regular expressions used by validation
      regExps = {
        emailRegExp : /^[\wæøå.-0-9a-zA-Z.+_]+@[\wæøå.-0-9a-zA-Z.+_]+\.[\wæøå.a-zA-Z]{2,}$/i, // Email
        minCharsRegExp : /\bminchars:+\d/i, // Minimum chracters
        equalToRegExp : /#(\S+)/, // Equalto field (id)
        numberRegExp : /^[0-9]*$/, // Match Number
        customRegExp : /\bcustom:'(.*?)'/i // Custom regular expression, to match the validation attribute and extract regexp from string

        // isSpaceOrEmpty = /^\s*$/, // Empty space or blank characters (not working yet)
        // emailRegExp = /^[\wæøå.-0-9a-zA-Z.+_]+@[\wæøå.-0-9a-zA-Z.+_]+\.[\wæøå.a-zA-Z]{2,}$/i, // Email
        // minCharsRegExp = /\bminchars:+\d/i, // Minimum chracters
        // equalToRegExp = /\bequalto:^\S+/i, // Equalto field ID
        // equalToRegExp = /\bequalto:(\S+)/, // Equalto field (id or class)
        // equalToRegExp = /#(\S+)/, // Equalto field (id)
        // numberRegExp = /^[0-9]*$/, // Number
        // customRegExp = /\:'(.*?)'/; // Custom regular expression, get everything after : and between ''
        // customRegExp = /\bcustom:'(.*?)'/i;
      },

      // Keys that will not trigger the keyup event
      disabledKeys = [
        // 9,  // backspace
        13, // enter
        16, // shift
        17, // ctrl
        18, // alt
        20, // caps lock
        27, // escape
        33, // page up
        34, // page down
        35, // end
        36, // home
        37, // left arrow
        38, // up arrow
        39, // right arrow
        40, // down arrow
        45  // insert
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
    dom.$validateField = $( selectors.validateField );
    dom.$submitButton = $( selectors.submitButton );
  }

  /**
   * Attach event listeners to DOM elements
   */
  function _addEventListeners() {

    if ( validationSettings.onKeyUp ) {
      dom.$validateField.on( 'keyup', _pitStop );
    }
    if ( validationSettings.onFocus ) {
      dom.$validateField.on( 'focus', _pitStop );
    }
    if ( validationSettings.onBlur ) {
      dom.$validateField.on( 'blur', _pitStop );
    }
    if ( validationSettings.onSubmit ) {
      dom.$form.on( 'submit', _pitStop );
    }


    // dom.$validateField.on( 'focus', _pitStop );
    // dom.$form.on( 'click', dom.$submitButton, _pitStop );
  }

  /**
   * Get the target field element from the event
   * determine the event type, and take action accordingly
   *
   * @param  {event} event
   * @return {void}
   */
  function _pitStop ( event ) {
    var $el = $( event.target ), // The form element in question

    // If fields ahve invalid or valid classes
    // This so taht we can validate on keyup, focus and blur
    fieldInvalid = $el.hasClass( classNames.valid ),
    fieldIsInvalid = $el.hasClass( classNames.invalid );

    // KEYUP event
    if ( event.type === 'keyup' ) {
      var key = event.keyCode ? event.keyCode : event.charCode;
      if ( disabledKeys.indexOf( key ) === -1 && ( fieldIsInvalid || fieldInvalid ) )  {
        _validateField($el);
      }
    }

    // BLUR event
    if ( event.type === 'blur' ) {
      // Only validate field on blur, if invalid
      if ( fieldIsInvalid ) {
        _validateField($el);
      }
    }

    // SUBMIT event
    // Sets submitBool to true, and if at least one of fields return false, it will be false, and cancel the submit
    if ( event.type === 'submit' ) {

      // event.preventDefault(); // temporarily disable event submit

      var $formToValidate = $(event.currentTarget);
      var submitBool = true;

      // Loop through fields in form
      $formToValidate.find( dom.$validateField ).each( function () {
        submitBool = _validateField($(this));

        // To debug which fields are failing
        if (debug && submitBool === false) {
          debugFieldValidationArray.push($(this).attr('id'));
        }
      });

      if (debug) {
        console.log('Fields that fail: ' + debugFieldValidationArray);
      }

      // If submitBool === true, form is valid, and submitted. Else it is not
      if (!submitBool) {
        // Set focus in first invalid field
        $formToValidate.find('.invalid:first').focus();
        return false;
      } else {
        alert('form is valid');
        return false;
      }
    }
  }

  /**
   * Validate field
   * This function is called in a field loop, and validates one field at a time
   * @param  {jQuery element} $this
   * @param  {variable} validation
   * @return {variable} validation
   */
  function _validateField($this, validation) {
    validation = true;

    var $type = $this.attr('type'), // Field type [text, password, email, ...]
        $validationType = $this.data('validation'), // Get types of validations for this field
        $value = $this.val(), // Field value
        $length = $value.length; // Field value length

    // Check if field belongs to TEXT INPUT FIELDS group
    if ( stringInputFields.indexOf( $type ) !== -1 ) {

      /*
        Clear all validation classes if EMPTY
      */
      if ( $length === 0 ) {
        $this.removeClass(classNames.invalid);
        $.each( validationTypes, function(i, n){
          $this.removeClass(n.toString());
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

        if ( regExps.emailRegExp.test( $value ) ) {
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

        if ( regExps.numberRegExp.test( $value ) ) {
          $this.removeClass(validationTypes.number);
        } else {
          $this.addClass(validationTypes.number);
          validation = false;
        }
      }

      /*
        Check if field wants MINIMUM CHARACTERS validation
      */
      if ( $length !== 0 && $validationType.indexOf( validationTypes.minchars ) !== -1 ) {

        // Get the number from validation string (minchars:number),
        // convert match from array to string, then remove the semi colon from string
        var minimumCharsToMatch = $validationType.match( regExps.minCharsRegExp ).toString();
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
        var customRegExpToMatch = $validationType.match( regExps.customRegExp ); // gets the custom regexp string
        customRegExpToMatch = new RegExp(customRegExpToMatch[1].replace('custom:', ''));

        // If the field value matches the customRegExpToMatch
        if ( customRegExpToMatch.test( $value ) ) {
          $this.removeClass(validationTypes.custom);
        } else {
          $this.addClass(validationTypes.custom);
          validation = false;
        }

      }

      /*
        Check if field wants EQUALTO validation
      */
      if ( $length !== 0 && $validationType.indexOf( validationTypes.equalto ) !== -1 ) {

        // Get the regular expression string from validation string (equalto:'string'),
        // convert match from array to string, then remove the semi colon from string
        var equaltoRegExpToMatch = $validationType.match( regExps.equalToRegExp )[0].toString(); // gets the equalto regexp string

        // equaltoRegExpToMatch = equaltoRegExpToMatch.replace('equalto:', '');
        var $equaltoFieldValue = $( equaltoRegExpToMatch ).val();

        // If the field value matches the equaltoRegExpToMatch
        if ( $value === $equaltoFieldValue ) {
          $this.removeClass(validationTypes.equalto);
        } else {
          $this.addClass(validationTypes.equalto);
          validation = false;
        }
      }

      // Check if validation === true || false
      // If field is not valid, remove valid class, and introduce invalid class
      if ( validation === false ) {
        $this.removeClass(classNames.valid);
        $this.addClass(classNames.invalid);

      // Check if field is valid, and has invalid class
      // If both are fulfilled, then remove invalid class, and add valid class
      // This is to ensure that fields that do not have 'required' validation,
      // do not get valid class if empty when validation is triggered
      } else if ( validation === true && $this.hasClass(classNames.invalid) ) {
        $this.removeClass(classNames.invalid);
        $this.addClass(classNames.valid);
      }

    }

    /*
      Checkbox validation
    */
    if ( $type === 'checkbox' && $validationType.indexOf( validationTypes.required ) !== -1 ) {

      if ( $this.prop('checked') === false ) {
        $this.removeClass(classNames.valid);
        $this.addClass(validationTypes.required);
        $this.addClass(classNames.invalid);
        validation = false;
      } else {
        $this.removeClass(validationTypes.required);
        $this.removeClass(classNames.invalid);
      }
    }

    // returns if the field in context is valid or not
    return validation;
  }

  ////////////////
  // Public API //
  ////////////////

  return {
    initialize: initialize
  };

})();
