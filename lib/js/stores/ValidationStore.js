"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Import all supported validation types
require('async-validate/plugin/all');
var Reflux = require("reflux");
var _ = require("lodash");
var Schema = require("async-validate");
var messages = require("async-validate/messages");
var ValidationActions = require("../actions/ValidationActions");
var ValidationUtils = require("../utils/ValidationUtils");

// Override default date error message
messages.date.invalid = "%s is not a valid date";

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

var ValidationStore = Reflux.createStore({
    init: function init() {
        this.fields = {};
        this.validateAll = {
            enabled: false, // Will validate all fields if set to true
            fields: {}, // Fields that are currently validated (this will not give information about field's validity)
            errors: [] // Final errors to return
        };
    },
    addField: function addField(name, rules) {
        // Add field only if it's not already there
        if (this.fields[name]) {
            console.error("A field with name " + name + " already exists, please find another name");
        } else {
            this.fields[name] = { rules: rules };
        }
    },
    removeField: function removeField(name) {
        delete this.fields[name];
    },
    validateField: function validateField(name, value) {
        var _this = this;

        var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

        var field = this.fields[name];
        if (!field) {
            console.error("Cannot find field " + name + " into ValidationStore");
            return null;
        }

        // If value hasn't changed, bypass validation
        if (!ValidationUtils.isEmpty(field.value) && !ValidationUtils.isEmpty(value) && field.value === value) {
            if (this.validateAll.enabled) {
                this._validateField(name, field.errors);
            }
            callback(field.errors); // Pass current field's error to callback
            // Validate Schema with field value using field's value and field's rules
        } else {
            this._getSchema(name).validate(_defineProperty({}, name, value), this._getValidateOptions(), function (exception, res) {
                var errors = res ? res.errors : undefined;
                // Keep a cache version of field's value and field's errors
                field.value = value;
                field.errors = errors;

                if (_this.validateAll.enabled) {
                    _this._validateField(name, errors);
                }
                callback(errors); // Pass potential errors to callback
            });
        }
    },
    validateAllFields: function validateAllFields() {
        this.validateAll = {
            enabled: true,
            fields: {},
            errors: []
        };
        ValidationActions.validateAllFields();
    },
    _getSchema: function _getSchema(fieldName) {
        return new Schema({
            type: "object",
            fields: _defineProperty({}, fieldName, this.fields[fieldName].rules)
        });
    },
    _getValidateOptions: function _getValidateOptions() {
        return {
            bail: true // Stop validation when the first error is encountered
        };
    },
    _validateField: function _validateField(name, error) {
        // Put a flag to true to say that this field has been validated
        this.validateAll.fields[name] = true;
        if (error) {
            this.validateAll.errors.push(_defineProperty({}, name, error)); // Add field's error to list of errors
        }
        // If all fields have been validated, stop the validateAll process and gives back field's errors to listeners
        if (_.isEmpty(_.difference(_.keys(this.fields), _.keys(this.validateAll.fields)))) {
            this.validateAll.enabled = false;
            this.trigger(!_.isEmpty(this.validateAll.errors) ? this.validateAll.errors : undefined);
        }
    }
});

module.exports = ValidationStore;