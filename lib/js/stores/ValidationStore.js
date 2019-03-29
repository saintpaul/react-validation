"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Import all supported validation types
require('async-validate/plugin/all');

var Reflux = require("reflux");

var _keys = require('lodash/keys');

var _difference = require('lodash/difference');

var _isEmpty = require('lodash/isEmpty');

var _reduce = require('lodash/reduce');

var Schema = require("async-validate");

var ValidationActions = require("../actions/ValidationActions");

var ValidationUtils = require("../utils/ValidationUtils");

var Config = require("../Configuration"); // Override default date error message


Config.MESSAGES.date.invalid = "%s is not a valid date";
/**
 * ValidationStore internal structure :
 * Fields = {
 *      firstName: {
 *          value: undefined,
 *          errors: [],
 *          rules: []
 *      }
 * }
 *
 * Async-validate schema structure :
 *  Schema = {
 *      fields: {
 *          firstName: { type: "string", required: true }
 *      }
 * }
 */

var ValidationStore =
/*#__PURE__*/
function (_Reflux$Store) {
  _inherits(ValidationStore, _Reflux$Store);

  function ValidationStore() {
    var _this;

    _classCallCheck(this, ValidationStore);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ValidationStore).call(this));

    _defineProperty(_assertThisInitialized(_this), "addField", function (name, rules, group) {
      // Add field only if it's not already there
      if (_this.fields[name]) {
        console.error("A field with name ".concat(name, " already exists, please find another name"));
      } else {
        _this.fields[name] = {
          rules: rules,
          group: group
        };
      }
    });

    _defineProperty(_assertThisInitialized(_this), "removeField", function (name) {
      delete _this.fields[name];
    });

    _defineProperty(_assertThisInitialized(_this), "validateField", function (name, value) {
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
      var field = _this.fields[name];

      if (!field) {
        console.error("Cannot find field ".concat(name, " into ValidationStore"));
        return null;
      } // If value hasn't changed, bypass validation


      if (!ValidationUtils.isEmpty(field.value) && !ValidationUtils.isEmpty(value) && field.value === value) {
        if (_this.validateAll.enabled) {
          _this._validateField(name, field.errors);
        }

        callback(field.errors); // Pass current field's error to callback
        // Validate Schema with field value using field's value and field's rules
      } else {
        _this._getSchema(name).validate(_defineProperty({}, name, value), _this._getValidateOptions(), function (exception, res) {
          var errors = res ? res.errors : undefined; // Keep a cache version of field's value and field's errors

          field.value = value;
          field.errors = errors;

          if (_this.validateAll.enabled) {
            _this._validateField(name, errors);
          }

          callback(errors); // Pass potential errors to callback
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "validateAllFields", function (group) {
      _this.validateAll = {
        enabled: true,
        fields: {},
        errors: [],
        group: group
      };
      ValidationActions.validateAllFields(group);
    });

    _defineProperty(_assertThisInitialized(_this), "_getSchema", function (fieldName) {
      return new Schema({
        type: "object",
        fields: _defineProperty({}, fieldName, _this.fields[fieldName].rules)
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_getValidateOptions", function () {
      return {
        bail: true,
        // Stop validation when the first error is encountered
        messages: Config.MESSAGES
      };
    });

    _defineProperty(_assertThisInitialized(_this), "_getGroupFields", function (group) {
      return _reduce(_this.fields, function (groupFields, field, fieldName) {
        if (field.group === group) groupFields.push(fieldName);
        return groupFields;
      }, []);
    });

    _defineProperty(_assertThisInitialized(_this), "_validateField", function (name, error) {
      // Put a flag to true to say that this field has been validated
      _this.validateAll.fields[name] = true;

      if (error) {
        _this.validateAll.errors.push(_defineProperty({}, name, error)); // Add field's error to list of errors

      } // If all fields have been validated, stop the validateAll process and gives back field's errors to listeners


      var fieldsToValidate = _this._getGroupFields(_this.validateAll.group);

      var validatedFields = _keys(_this.validateAll.fields);

      if (_isEmpty(_difference(fieldsToValidate, validatedFields))) {
        _this.validateAll.enabled = false;

        _this.trigger({
          errors: _this.validateAll.errors,
          group: _this.validateAll.group
        });
      }
    });

    _this.fields = {};
    _this.validateAll = {
      enabled: false,
      // Will validate all fields if set to true
      fields: {},
      // Fields that are currently validated (this will not give information about field's validity)
      errors: [],
      // Final errors to return;
      group: undefined // If set, will validate all fields that belongs to this group

    };
    return _this;
  }

  return ValidationStore;
}(Reflux.Store);

module.exports = new ValidationStore();