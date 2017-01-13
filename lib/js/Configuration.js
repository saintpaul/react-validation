"use strict";

var Messages = require("async-validate/messages");

var Configuration = {
    ICON_ERROR_CLASS: "fa fa-exclamation-triangle",
    ICON_VALID_CLASS: "fa fa-check",
    COUNT_MESSAGE: function COUNT_MESSAGE(count) {
        return count + " character(s) remaining";
    },
    MESSAGES: Messages, // Takes by default async-validate messages. A full object can be passed or some properties can be overrided manually
    ERROR_MESSAGE_FIELD_NAME: "This field" // Used in error message replacement mechanism (See ValidationField.errorMessage)
};

module.exports = Configuration;