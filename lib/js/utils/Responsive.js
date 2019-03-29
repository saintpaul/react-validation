"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Responsive = function Responsive() {
  _classCallCheck(this, Responsive);
};

_defineProperty(Responsive, "isTablet", function () {
  return window.innerWidth <= 1024;
});

module.exports = Responsive;