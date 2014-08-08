var App = App || {};

/**
 * [description]
 * @return {[type]} [description]
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
        password: 'password'
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
    dom.$validateField.on( 'focus', _pitStop );
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

    // Get event type to determine what to do next
    if ( event.type === 'focus' || event.type === 'keyup' ) {
      // console.log( 'element: ' + $el.data('validation') + '\nvalidation type(s): ' + [$el.data('validation').split(' ')] + '\n---------' );
      _validate($el);
    } else if ( event.type === 'blur' ) {
      _validate($el);
    } else if ( event.type === 'submit' ) {
      // Validate all fields in form
      console.log('submitting form');
      return false;
    }
  }

  /**
   * Validate fields
   * @param  {jQuery element} $this
   * @param  {variable} validation
   * @return {variable} validation
   */
  function _validate($this, validation) {
    validation = false;

    var $type = $this.attr('type'), // Field type [text, password, email, ...]
        $validationType = $this.data('validation'), // Get types of validations for this field
        $value = $this.val(), // Field value
        $length = $value.length, // Field value length
        emailRegExp = /^[\wæøå.-0-9a-zA-Z.+_]+@[\wæøå.-0-9a-zA-Z.+_]+\.[\wæøå.a-zA-Z]{2,}$/i; // Email validation regular expression

    // if( $length < 2 ) {
    //   $this.removeClass(classNames.valid);
    //   $this.addClass(classNames.required);
    //   validation = false;
    // }

    // Check if field belongs to TEXT INPUT FIELDS group
    if ( stringInputFields.indexOf( $type ) !== -1 ) {
      console.log('this is a TEXT INPUT FIELD');

      // Check if field has 'required' validation attached to it
      if ( $validationType.indexOf( validationTypes.required ) !== -1 ) {
        console.log('..and it requires a value to validate!');

        if ( $length === 0 ) {
          $this.removeClass(classNames.valid);
          $this.addClass(classNames.invalid).addClass(validationTypes.required);
          validation = false;
        } else {
          $this.removeClass(classNames.invalid).removeClass(validationTypes.required);
          $this.addClass(classNames.valid);
        }

      }
      // Check if field wants EMAIL validation on the side
      if ( $validationType.indexOf( validationTypes.email ) !== -1 ) {
        console.log('..and it wants us to validate EMAIL!');

        if ( !emailRegExp.test( $value ) ) {
          $this.removeClass(classNames.valid);
          $this.addClass(classNames.invalid).addClass(validationTypes.email);
          validation = false;
        } else {
          $this.removeClass(classNames.invalid).removeClass(validationTypes.email);
          $this.addClass(classNames.valid);
        }
      }
    }

    // if( $type === 'text' ) {
    //   if ( $validationTypes.indexOf( classNames.required ) !== -1 ) {
    //     if ( $length === 0 ) {
    //       $this.removeClass(classNames.valid);
    //       $this.addClass(classNames.required);
    //       validation = false;
    //     } else {

    //     }
    //   }
    // }
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

    return validation;
  }

  ////////////////
  // Public API //
  ////////////////

  return {
    initialize: initialize
  };

})();
