"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');

var PropTypes = require('prop-types');

var _require = require("sp-react-commons"),
    RefluxComponent = _require.RefluxComponent;

var _clone = require('lodash/clone');

var _merge = require('lodash/merge');

var ValidationStore = require('./stores/ValidationStore'); // TODO RCH : add a spinner icon on this component until validation is not over


var ValidationSubmit =
/*#__PURE__*/
function (_RefluxComponent) {
  _inherits(ValidationSubmit, _RefluxComponent);

  function ValidationSubmit(props) {
    var _this;

    _classCallCheck(this, ValidationSubmit);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ValidationSubmit).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_cleanProps", function () {
      var newProps = _clone(_this.props);

      delete newProps.onClick;
      delete newProps.onSuccess;
      delete newProps.renderFactory;
      delete newProps.errorMessage;
      delete newProps.group;
      return newProps;
    });

    _defineProperty(_assertThisInitialized(_this), "onSuccess", function (_ref) {
      var errors = _ref.errors,
          group = _ref.group;

      if (group === _this.props.group) {
        var hasErrors = errors && errors.length > 0;

        _this.setState({
          hasError: hasErrors
        });

        _this.props.onSuccess(hasErrors ? errors : undefined);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "submit", function (e) {
      e.preventDefault();

      _this.props.onClick();

      ValidationStore.validateAllFields(_this.props.group); //Case where a form has dynamic field and suddenly has no field to validate but need to be submitted

      if (Object.keys(ValidationStore.fields).length === 0) _this.props.onSuccess();
    });

    _defineProperty(_assertThisInitialized(_this), "renderButton", function (newProps) {
      return React.createElement("div", {
        className: "validation-submit"
      }, React.createElement("button", _extends({}, newProps, {
        onClick: _this.submit
      })), _this.state.hasError ? React.createElement("div", {
        className: "validation-submit__error"
      }, newProps.errorMessage) : null);
    });

    _defineProperty(_assertThisInitialized(_this), "render", function () {
      var newProps = _merge(_this._cleanProps(), {
        onClick: _this.submit
      });

      return _this.props.renderFactory ? _this.props.renderFactory(newProps, _this.state.hasError) : _this.renderButton(newProps);
    });

    _this.state = {
      hasError: false
    };

    _this.listenTo(ValidationStore, _this.onSuccess);

    return _this;
  }

  return ValidationSubmit;
}(RefluxComponent);

ValidationSubmit.defaultProps = {
  onClick: function onClick() {},
  errorMessage: "Some fields are incorrect, please review them."
};
ValidationSubmit.propTypes = {
  group: PropTypes.string,
  // If set, it will only validate all fields that belongs to this group
  onClick: PropTypes.func,
  onSuccess: PropTypes.func.isRequired,
  renderFactory: PropTypes.func,
  errorMessage: PropTypes.string
};
module.exports = ValidationSubmit;