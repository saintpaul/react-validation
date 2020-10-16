"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get2(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get2 = Reflect.get; } else { _get2 = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get2(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');

var PropTypes = require('prop-types');

var classnames = require("classnames");

var _cloneDeep = require('lodash/cloneDeep');

var _findIndex = require('lodash/findIndex');

var _has = require('lodash/has');

var _merge = require('lodash/merge');

var _map = require('lodash/map');

var _keys = require('lodash/keys');

var _includes = require('lodash/includes');

var _get = require('lodash/get');

var _find = require('lodash/find');

var _isArray = require('lodash/isArray');

var _isEmpty = require('lodash/isEmpty');

var _isUndefined = require('lodash/isUndefined');

var _require = require("sp-react-commons"),
    RefluxComponent = _require.RefluxComponent;

var Tooltip = require("react-tooltip");

var ValidationUtils = require('./utils/ValidationUtils');

var Responsive = require('./utils/Responsive');

var ValidationTypes = require('./ValidationTypes');

var ValidationStore = require('./stores/ValidationStore');

var ValidationActions = require('./actions/ValidationActions');

var Config = require("./Configuration");

var SUPPORTED_VALUE_PROPS = {
  value: "value",
  // For all inputs text / other components
  checked: "checked",
  // For checkboxes
  dateTime: "dateTime" // For datetime picker

};
/**
 * ValidationField
 * Wraps an input field and apply some rules on it. According to rules, it will display an error message.
 * This component is based on https://github.com/tmpfs/async-validate project
 */

var ValidationField =
/*#__PURE__*/
function (_RefluxComponent) {
  _inherits(ValidationField, _RefluxComponent);

  function ValidationField(props) {
    var _this;

    _classCallCheck(this, ValidationField);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ValidationField).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "getValueProp", function () {
      return _find(_keys(_this.getInput().props), function (propKey) {
        return _includes(_keys(SUPPORTED_VALUE_PROPS), propKey);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "getInput", function () {
      return _this.props.children;
    });

    _defineProperty(_assertThisInitialized(_this), "getInputValue", function () {
      return _this.getInput().props[_this.getValueProp()];
    });

    _defineProperty(_assertThisInitialized(_this), "getInputOnChange", function () {
      return _this.getInput().props.onChange;
    });

    _defineProperty(_assertThisInitialized(_this), "getInputOnBlur", function () {
      return _this.getInput().props.onBlur;
    });

    _defineProperty(_assertThisInitialized(_this), "getRule", function (rule) {
      return _get(_this.props.rules, rule) || _get(_find(_this.props.rules, function (r) {
        return _has(r, rule);
      }), rule);
    });

    _defineProperty(_assertThisInitialized(_this), "hasRuleType", function (ruleType) {
      return _find(_this.props.rules, function (rule) {
        return rule === ruleType || rule.type === ruleType;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "isDatePicker", function () {
      return _this.getInput().props.validationType === ValidationTypes.REACT_DATEPICKER;
    });

    _defineProperty(_assertThisInitialized(_this), "isCheckbox", function () {
      return _this.getInput().props.type === ValidationTypes.CHECKBOX;
    });

    _defineProperty(_assertThisInitialized(_this), "isTextarea", function () {
      return _this.getInput().type === ValidationTypes.TEXTAREA;
    });

    _defineProperty(_assertThisInitialized(_this), "getInputValueFromEvent", function (e) {
      if (e && e.target) {
        if (e.target.checked) {
          return e.target.checked;
        } else {
          return e.target.value;
        }
      } else {
        return e;
      }
    });

    _defineProperty(_assertThisInitialized(_this), "rulesIsArray", function () {
      return _isArray(_this.props.rules);
    });

    _defineProperty(_assertThisInitialized(_this), "_onChange", function (e) {
      var inputEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      var inputValue = _this.convertValue(_this.getInputValueFromEvent(e));

      var inputEventCallback = function inputEventCallback(value) {
        return inputEvent(value);
      }; // Validate input and then call original 'onChange / onBlur...' event from input field


      _this.validate(inputValue, function () {
        return inputEventCallback(inputValue);
      });

      return inputValue;
    });

    _defineProperty(_assertThisInitialized(_this), "onChange", function (e) {
      return _this._onChange(e, _this.getInputOnChange());
    });

    _defineProperty(_assertThisInitialized(_this), "onBlur", function () {
      return _this._onChange(_this.getInputValue(), _this.getInputOnBlur());
    });

    _defineProperty(_assertThisInitialized(_this), "validate", function (inputValue) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      // Trigger validation on others fields if needed
      if (_this.props.triggerFields) {
        ValidationActions.forceValidateFields(_isArray(_this.props.triggerFields) ? _this.props.triggerFields : [_this.props.triggerFields]);
      } // Apply some conversion for special cases to fit async-validate expectations


      inputValue = _this.convertSpecialCases(inputValue); // Validate field and display error message if needed

      ValidationStore.validateField(_this.props.name, inputValue, function (errors) {
        // setTimeout is used as a trick here to avoid asynchronous issues (browser is moving caret to the end of the field
        // because we're changing the state here and in the child component)
        var firstError = errors ? errors[0].message : undefined;
        setTimeout(function () {
          _this.props.onError(firstError); // Call 'onError' callback


          if (_this._isMounted) _this.setState({
            error: firstError,
            isValid: !firstError
          }); // Only display the first error
        }, 0);
      }); // Always call 'callback' to avoid issue with asynchronous validation (jumping caret)

      callback();
    });

    _defineProperty(_assertThisInitialized(_this), "errorMessage", function (msg, params) {
      // Replace first param (= name of the field)
      params[0] = Config.ERROR_MESSAGE_FIELD_NAME; // Replace each parameter with his corresponding value

      _map(params, function (p) {
        return msg = msg.replace("%s", p);
      });

      return msg;
    });

    _defineProperty(_assertThisInitialized(_this), "convertValidatorRule", function (rule) {
      // Convert a simple validator
      if (rule.validator) {
        return function (callback) {
          var errorCallback = this.raise.bind(this);
          rule.validator(this.value, errorCallback);
          callback();
        }; // Convert an asyncValidator
      } else if (rule.asyncValidator) {
        return function (callback) {
          var _this2 = this;

          // Create a simpler way to trigger error message when 'callback' will be called
          var triggerCallback = function triggerCallback(error) {
            if (error) _this2.raise(error);
            callback();
          };

          rule.asyncValidator(this.value, triggerCallback);
        }; // Ignore rule
      } else {
        return rule;
      }
    });

    _defineProperty(_assertThisInitialized(_this), "convertValue", function (inputValue) {
      var convertedValue = inputValue; // Try to convert input value according to his rule's type
      // TODO RCH : maybe it can be improved by using "transform" property from async-validate lib

      if (_this.hasRuleType("integer")) convertedValue = ValidationUtils.toInteger(inputValue);else if (_this.hasRuleType("float") || _this.hasRuleType("number")) convertedValue = ValidationUtils.toFloat(inputValue);else if (_this.hasRuleType("string")) convertedValue = ValidationUtils.toString(inputValue);else if (_this.hasRuleType("boolean")) convertedValue = ValidationUtils.toBoolean(inputValue);
      return convertedValue;
    });

    _defineProperty(_assertThisInitialized(_this), "convertSpecialCases", function (inputValue) {
      if (_isEmpty(inputValue) && (_this.hasRuleType("array") || _this.hasRuleType("object"))) return undefined;else return inputValue;
    });

    _defineProperty(_assertThisInitialized(_this), "forceValidate", function (group) {
      // Validate current field only if it belongs to asked group
      if (_this.props.group === group) _this.validate(_this.convertValue(_this.getInputValue()));
    });

    _defineProperty(_assertThisInitialized(_this), "forceValidateFromFields", function (fieldNames
    /*:array*/
    ) {
      // Validate this input only if it appears into list of fields to validate
      if (_find(fieldNames, function (name) {
        return name === _this.props.name;
      })) _this.validate(_this.convertValue(_this.getInputValue()));
    });

    _defineProperty(_assertThisInitialized(_this), "showCharsLeft", function () {
      return _this.props.showCharsLeft;
    });

    _defineProperty(_assertThisInitialized(_this), "showIcons", function () {
      return _this.props.showIcons && !_this.isCheckbox() && !_this.isTextarea();
    });

    _defineProperty(_assertThisInitialized(_this), "showLabel", function () {
      return _this.props.label;
    });

    _defineProperty(_assertThisInitialized(_this), "className", function () {
      return classnames("validation-field", _this.props.className, {
        "validation-field--error": _this.state.error,
        "validation-field--success": _this.state.isValid,
        "validation-field--with-icons": _this.showLabel(),
        // Hide icon by default field is a Select / checkbox
        "validation-field--with-count": _this.showCharsLeft(),
        // Hide icon by default field is a Select / checkbox
        "validation-field--date-picker": _this.isDatePicker(),
        // Add a different class for date-picker
        "validation-field--checkbox": _this.isCheckbox() // Add a different class for checkbox

      });
    });

    _defineProperty(_assertThisInitialized(_this), "renderError", function () {
      return Responsive.isTablet() ? _this.state.error ? React.createElement("div", {
        className: "validation-field__error-message",
        dangerouslySetInnerHTML: {
          __html: _this.state.error
        }
      }) : null : React.createElement(Tooltip, {
        id: _this.props.name,
        effect: "solid",
        class: "validation-field__tooltip",
        html: true
      }, _this.state.error);
    });

    _defineProperty(_assertThisInitialized(_this), "renderCharsLeft", function () {
      var value = _this.getInputValue();

      var count = value && value.length ? value.length : 0;

      var maxChars = _this.getRule("max");

      var charsLeft = count >= maxChars ? 0 : maxChars - count;
      var threshold = _this.props.charsLeftThreshold ? _this.props.charsLeftThreshold(charsLeft, maxChars) : Config.CHARS_LEFT_THRESHOLD(charsLeft, maxChars); // If threshold has been reached, do not display any message about remaining chars

      if (!threshold) return;
      var charsLeftMessage = _this.props.charsLeftMessage ? _this.props.charsLeftMessage(charsLeft) : Config.COUNT_MESSAGE(charsLeft);
      return React.createElement("div", {
        className: "validation-field__chars-left"
      }, charsLeftMessage);
    });

    _defineProperty(_assertThisInitialized(_this), "renderIcon", function () {
      if (_this.state.error || _this.state.isValid) {
        var iconClass = _this.state.error ? _this.props.iconErrorClass || Config.ICON_ERROR_CLASS : _this.state.isValid ? _this.props.iconValidClass || Config.ICON_VALID_CLASS : "";
        return React.createElement("i", {
          className: "validation-field__icon ".concat(iconClass)
        });
      } else {
        return null;
      }
    });

    _defineProperty(_assertThisInitialized(_this), "renderLabel", function () {
      return React.createElement("label", {
        className: "validation-field__label",
        dangerouslySetInnerHTML: {
          __html: _this.props.label
        },
        htmlFor: _this.props.name
      });
    });

    _defineProperty(_assertThisInitialized(_this), "render", function () {
      if (!_this.getInput() || _isArray(_this.getInput())) {
        console.error("ValidationField with name '".concat(_this.props.name, "' need to have exactly one child"));
        return null;
      }

      if (_this.showCharsLeft() && _isUndefined(_this.getRule("max"))) console.error("ValidationField with name '".concat(_this.props.name, "' should declare 'max' rule because 'showCharsLeft' is defined")); // Clone children input and attach 'onChange' function in order to validate/convert data

      var onChange = {
        onChange: _this.onChange,
        id: _this.props.name
      };
      var onBlur = _this.props.triggerOnBlur ? _this.isDatePicker() ? // Exception for DatePicker
      {
        inputProps: _merge(_this.getInput().props.inputProps, {
          onBlur: _this.onBlur
        })
      } : {
        onBlur: _this.onBlur
      } : {};

      var newProps = _merge(onChange, onBlur);

      var input = React.cloneElement(_this.getInput(), newProps);
      var tooltipProps = {
        "data-tip": "",
        "data-for": _this.props.name,
        "data-event": "mouseenter touchstart click",
        "data-event-off": "mouseleave",
        "data-iscapture": true // Will propagates all events in data-event

      };
      return React.createElement(React.Fragment, null, React.createElement("div", {
        className: _this.className()
      }, _this.showLabel() ? _this.renderLabel() : null, React.createElement("div", _extends({
        className: "validation-field__input-wrapper"
      }, tooltipProps), input, _this.showIcons() ? _this.renderIcon() : null), _this.showCharsLeft() ? _this.renderCharsLeft() : null, !_this.isCheckbox() ? _this.renderError() : null), _this.isCheckbox() ? _this.renderError() : null);
    });

    _this.state = {
      error: undefined,
      isValid: undefined
    };
    _this._isMounted = false;

    _this.listenTo(ValidationActions.validateAllFields, _this.forceValidate);

    _this.listenTo(ValidationActions.forceValidateFields, _this.forceValidateFromFields);

    return _this;
  }

  _createClass(ValidationField, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this3 = this;

      this._isMounted = true; // Check if input children contains a valid prop to get his value

      if (this.getValueProp()) {
        // Update rules by adding "required: true" and "whitespace: true" as default values (if not already set)
        var rules = _cloneDeep(this.props.rules);

        if (this.rulesIsArray()) {
          var requiredRuleIndex = _findIndex(rules, function (rule) {
            return _has(rule, "required");
          });

          var ruleTypeIndex = _findIndex(rules, function (rule) {
            return _has(rule, "type");
          });

          var ruleType = ruleTypeIndex !== -1 ? rules[ruleTypeIndex].type : "string"; //let ruleIndexToUpdate = requiredRuleIndex !== -1 ? requiredRuleIndex : ruleTypeIndex;

          var ruleIndexToUpdate = ruleTypeIndex !== -1 ? ruleTypeIndex : requiredRuleIndex; // Update or add "required" rule which is the result of the merge between new rule and old rule

          var newRequiredRule = _merge({
            required: true,
            whitespace: true,
            type: ruleType,
            message: this.errorMessage
          }, rules[ruleIndexToUpdate]);

          if (ruleTypeIndex === -1 && requiredRuleIndex === -1) {
            rules.push(newRequiredRule);
          } else {
            rules.splice(ruleIndexToUpdate, 1, newRequiredRule);
          } // Need to convert validators from { validator: fn } to fn
          // During schema validation, async-validate will automatically call these function validators


          rules = _map(rules, function (rule) {
            return _this3.convertValidatorRule(rule);
          });
        } else {
          // Just merge current rule with default one
          rules = _merge({
            required: true,
            whitespace: true,
            type: "string",
            message: this.errorMessage
          }, rules);
        } // When component is mounted, add it to ValidationStore so it must be able to validate this particular field


        ValidationStore.addField(this.props.name, rules, this.props.group);
      } else {
        console.error("Field with name '".concat(this.props.name, "' should have one of these props : ").concat(_keys(SUPPORTED_VALUE_PROPS)));
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      // Will call RefluxListener.componentWillUnmount and stop listening to actions
      _get2(_getPrototypeOf(ValidationField.prototype), "componentWillUnmount", this).call(this);

      this._isMounted = false; // When component is unmounted, remove it from ValidationStore because this field should not be validated anymore

      ValidationStore.removeField(this.props.name);
    } // Look into child props to check if it provides one of supported values

  }]);

  return ValidationField;
}(RefluxComponent);

ValidationField.defaultProps = {
  rules: {},
  onError: function onError() {},
  onBlur: false,
  showCharsLeft: false,
  showIcons: true
};
ValidationField.propTypes = {
  name: PropTypes.string.isRequired,
  group: PropTypes.string,
  // If set, this field will be isolated into a "group" of fields
  label: PropTypes.string,
  rules: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]).isRequired,
  // List of rules, see https://github.com/tmpfs/async-validate#rules
  triggerFields: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  // Field or list of fields for which validation should be triggered when this component is changing
  onError: PropTypes.func,
  triggerOnBlur: PropTypes.bool,
  // If true, validation will be triggered during onBlur event as well
  showCharsLeft: PropTypes.bool,
  // If true, display number of remaining chars. A 'max' rule must be set.
  charsLeftMessage: PropTypes.func,
  // Message to display when 'showCharsLeft' property is true (can be configured as well in Config.COUNT_MESSAGE)
  charsLeftThreshold: PropTypes.func,
  // Threshold before displaying chars left message (can be configured as well in Config.CHARS_LEFT_THRESHOLD)
  showIcons: PropTypes.bool,
  // If true, display an icon according to field's validity
  iconValidClass: PropTypes.string,
  // Icon class to apply when field is valid (this option can be globally set in Configuration.js as well)
  iconErrorClass: PropTypes.string,
  // Icon class to apply when field is not valid (this option can be globally set in Configuration.js as well)
  className: PropTypes.string // Additional class name

};
module.exports = ValidationField;