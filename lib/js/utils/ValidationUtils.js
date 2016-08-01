"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");

var ValidationUtils = function () {
    function ValidationUtils() {
        _classCallCheck(this, ValidationUtils);
    }

    _createClass(ValidationUtils, null, [{
        key: "toInteger",
        value: function toInteger(input) {
            if (ValidationUtils.isEmpty(input)) return undefined;

            var num = Number(input);
            if (!isNaN(num)) num = parseInt(input);

            return isNaN(num) ? input : num;
        }
    }, {
        key: "toFloat",
        value: function toFloat(input) {
            if (ValidationUtils.isEmpty(input)) return undefined;

            var num = input;
            if (_.isNumber(input)) {
                num = input.toString();
            }

            // Need to perform this regexp to avoid parseFloat() to convert xx. to xx
            if (/^\-?[0-9]+\.?[0-9]*$/.test(num)) {
                if (num.endsWith(".") || num.endsWith(".0")) {
                    return num;
                } else {
                    return parseFloat(num);
                }
            } else {
                return num;
            }
        }
    }, {
        key: "toString",
        value: function toString(input) {
            if (ValidationUtils.isEmpty(input)) return undefined;

            var string = input;
            if (_.isString(string)) {
                string = input.toString();
            }
            return string;
        }
    }, {
        key: "toBoolean",
        value: function toBoolean(input) {
            return input === "true" || input === true;
        }
    }, {
        key: "isEmpty",
        value: function isEmpty(input) {
            return _.isNull(input) || _.isUndefined(input) || input === "";
        }
    }]);

    return ValidationUtils;
}();

module.exports = ValidationUtils;