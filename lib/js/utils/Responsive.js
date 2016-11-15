"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Responsive = function Responsive() {
    _classCallCheck(this, Responsive);
};

Responsive.isTablet = function () {
    return window.innerWidth <= 1024;
};

module.exports = Responsive;