// Import all supported validation types
require('async-validate/plugin/all');
const Reflux                = require("reflux");
const _                     = require("lodash");
const Schema                = require("async-validate");
const messages              = require("async-validate/messages");
const ValidationActions     = require("../actions/ValidationActions");
const ValidationUtils       = require("../utils/ValidationUtils");

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

    init() {
        this.fields = {};
        this.validateAll = {
            enabled: false, // Will validate all fields if set to true
            fields: {},     // Fields that are currently validated (this will not give information about field's validity)
            errors: []      // Final errors to return
        };
    },

    addField(name, rules) {
        // Add field only if it's not already there
        if(!this.fields[name])
            this.fields[name] = {rules: rules};
    },

    removeField(name) {
        delete this.fields[name];
    },

    validateField(name, value, callback = () => {}) {
        var field = this.fields[name];
        if(!field) {
            console.error("Cannot find field '", name, "' into ValidationStore");
            return null;
        }

        // If value hasn't changed, bypass validation
        if(!ValidationUtils.isEmpty(field.value) && !ValidationUtils.isEmpty(value) && field.value === value) {
            if(this.validateAll.enabled) {
                this._validateField(name, field.errors);
            }
            callback(field.errors); // Pass current field's error to callback
        // Validate Schema with field value using field's value and field's rules
        } else {
            this._getSchema(name).validate({ [name]: value }, this._getValidateOptions(), (exception, res) => {
                let errors = res ? res.errors : undefined;
                // Keep a cache version of field's value and field's errors
                field.value = value;
                field.errors = errors;

                if(this.validateAll.enabled) {
                    this._validateField(name, errors);
                }
                callback(errors); // Pass potential errors to callback
            });
        }
    },

    validateAllFields() {
        this.validateAll = {
            enabled: true,
            fields: {},
            errors: []
        };
        ValidationActions.validateAllFields();
    },

    _getSchema(fieldName) {
        return new Schema({
            type: "object",
            fields: { [fieldName]: this.fields[fieldName].rules }
        });
    },

    _getValidateOptions() {
        return {
            bail: true // Stop validation when the first error is encountered
        };
    },

    _validateField(name, error) {
        // Put a flag to true to say that this field has been validated
        this.validateAll.fields[name] = true;
        if (error) {
            this.validateAll.errors.push({ [name]: error }); // Add field's error to list of errors
        }
        // If all fields have been validated, stop the validateAll process and gives back field's errors to listeners
        if (_.isEmpty(_.difference(_.keys(this.fields), _.keys(this.validateAll.fields)))) {
            this.validateAll.enabled = false;
            this.trigger(!_.isEmpty(this.validateAll.errors) ? this.validateAll.errors : undefined );
        }
    }

});

module.exports = ValidationStore;