"use strict";

var Configuration = {
    ICON_ERROR_CLASS: "fa fa-exclamation-triangle",
    ICON_VALID_CLASS: "fa fa-check",
    COUNT_MESSAGE: function COUNT_MESSAGE(count) {
        return count + " character(s) remaining";
    }
};

module.exports = Configuration;