'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Import all supported validation types
require('async-validate/plugin/all');
var Reflux = require("reflux");
var _keys = require('lodash/keys');
var _difference = require('lodash/difference');
var _isEmpty = require('lodash/isEmpty');
var _reduce = require('lodash/reduce');
var Schema = require("async-validate");
var messages = require("async-validate/messages");
var ValidationActions = require("../actions/ValidationActions");
var ValidationUtils = require("../utils/ValidationUtils");
var Config = require("../Configuration");

// Override default date error message
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

var ValidationStore = Reflux.createStore({
    init: function init() {
        this.fields = {};
        this.validateAll = {
            enabled: false, // Will validate all fields if set to true
            fields: {}, // Fields that are currently validated (this will not give information about field's validity)
            errors: [], // Final errors to return;
            group: undefined // If set, will validate all fields that belongs to this group
        };
    },
    addField: function addField(name, rules, group) {
        // Add field only if it's not already there
        if (this.fields[name]) {
            console.error('A field with name ' + name + ' already exists, please find another name');
        } else {
            this.fields[name] = { rules: rules, group: group };
        }
    },
    removeField: function removeField(name) {
        delete this.fields[name];
    },
    validateField: function validateField(name, value) {
        var _this = this;

        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

        var field = this.fields[name];
        if (!field) {
            console.error('Cannot find field ' + name + ' into ValidationStore');
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
    validateAllFields: function validateAllFields(group) {
        this.validateAll = {
            enabled: true,
            fields: {},
            errors: [],
            group: group
        };
        ValidationActions.validateAllFields(group);
    },
    _getSchema: function _getSchema(fieldName) {
        return new Schema({
            type: "object",
            fields: _defineProperty({}, fieldName, this.fields[fieldName].rules)
        });
    },
    _getValidateOptions: function _getValidateOptions() {
        return {
            bail: true, // Stop validation when the first error is encountered
            messages: Config.MESSAGES
        };
    },
    _getGroupFields: function _getGroupFields(group) {
        return _reduce(this.fields, function (groupFields, field, fieldName) {
            if (field.group === group) groupFields.push(fieldName);
            return groupFields;
        }, []);
    },
    _validateField: function _validateField(name, error) {
        // Put a flag to true to say that this field has been validated
        this.validateAll.fields[name] = true;
        if (error) {
            this.validateAll.errors.push(_defineProperty({}, name, error)); // Add field's error to list of errors
        }
        // If all fields have been validated, stop the validateAll process and gives back field's errors to listeners
        var fieldsToValidate = this._getGroupFields(this.validateAll.group);
        var validatedFields = _keys(this.validateAll.fields);
        if (_isEmpty(_difference(fieldsToValidate, validatedFields))) {
            this.validateAll.enabled = false;
            this.trigger({
                errors: this.validateAll.errors,
                group: this.validateAll.group
            });
        }
    }
});

module.exports = ValidationStore;