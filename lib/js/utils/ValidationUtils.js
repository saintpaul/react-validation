"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _isString = require('lodash/isString');

var _isNumber = require('lodash/isNumber');

var _isNull = require('lodash/isNull');

var _isUndefined = require('lodash/isUndefined');

var ValidationUtils =
/*#__PURE__*/
function () {
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

      if (_isNumber(input)) {
        num = input.toString();
      } // Need to perform this regexp to avoid parseFloat() to convert xx. to xx


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

      if (_isString(string)) {
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
      return _isNull(input) || _isUndefined(input) || input === "";
    }
  }]);

  return ValidationUtils;
}();

module.exports = ValidationUtils;