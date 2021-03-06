const Messages = require("async-validate/messages");

const Configuration = {
    ICON_ERROR_CLASS: "fa fa-exclamation-triangle",
    ICON_VALID_CLASS: "fa fa-check",
    COUNT_MESSAGE: (count) => `${count} character(s) remaining`,
    CHARS_LEFT_THRESHOLD: (charsLeft, maxChars) => (charsLeft / maxChars) <= 0.3, // By default, chars left will be displayed if there are 30% less chars remaining
    MESSAGES: Messages, // Takes by default async-validate messages. A full object can be passed or some properties can be overrided manually
    ERROR_MESSAGE_FIELD_NAME: "This field" // Used in error message replacement mechanism (See ValidationField.errorMessage)
};

module.exports = Configuration;