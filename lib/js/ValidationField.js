'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get2 = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
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

var _require = require("react-commons"),
    RefluxComponent = _require.RefluxComponent;

var Tooltip = require("react-tooltip");

var ValidationUtils = require('./utils/ValidationUtils');
var Responsive = require('./utils/Responsive');
var ValidationTypes = require('./ValidationTypes');

var ValidationStore = require('./stores/ValidationStore');
var ValidationActions = require('./actions/ValidationActions');

var Config = require("./Configuration");

var SUPPORTED_VALUE_PROPS = {
    value: "value", // For all inputs text / other components
    checked: "checked", // For checkboxes
    dateTime: "dateTime" // For datetime picker
};

/**
 * ValidationField
 * Wraps an input field and apply some rules on it. According to rules, it will display an error message.
 * This component is based on https://github.com/tmpfs/async-validate project
 */

var ValidationField = function (_RefluxComponent) {
    _inherits(ValidationField, _RefluxComponent);

    function ValidationField(props) {
        _classCallCheck(this, ValidationField);

        var _this = _possibleConstructorReturn(this, (ValidationField.__proto__ || Object.getPrototypeOf(ValidationField)).call(this, props));

        _this.getValueProp = function () {
            return _find(_keys(_this.getInput().props), function (propKey) {
                return _includes(_keys(SUPPORTED_VALUE_PROPS), propKey);
            });
        };

        _this.getInput = function () {
            return _this.props.children;
        };

        _this.getInputValue = function () {
            return _this.getInput().props[_this.getValueProp()];
        };

        _this.getInputOnChange = function () {
            return _this.getInput().props.onChange;
        };

        _this.getInputOnBlur = function () {
            return _this.getInput().props.onBlur;
        };

        _this.getRule = function (rule) {
            return _get(_this.props.rules, rule) || _get(_find(_this.props.rules, function (r) {
                return _has(r, rule);
            }), rule);
        };

        _this.hasRuleType = function (ruleType) {
            return _find(_this.props.rules, function (rule) {
                return rule === ruleType || rule.type === ruleType;
            });
        };

        _this.isSelect = function () {
            return _this.getInput().props.validationType === ValidationTypes.REACT_SELECT;
        };

        _this.isDatePicker = function () {
            return _this.getInput().props.validationType === ValidationTypes.REACT_DATEPICKER;
        };

        _this.isCheckbox = function () {
            return _this.getInput().props.type === ValidationTypes.CHECKBOX;
        };

        _this.isTextarea = function () {
            return _this.getInput().type === ValidationTypes.TEXTAREA;
        };

        _this.getInputValueFromEvent = function (e) {
            if (e && e.target) {
                if (e.target.checked) {
                    return e.target.checked;
                } else {
                    return e.target.value;
                }
            } else {
                return e;
            }
        };

        _this.rulesIsArray = function () {
            return _isArray(_this.props.rules);
        };

        _this._onChange = function (e) {
            var inputEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            var inputValue = _this.convertValue(_this.getInputValueFromEvent(e));
            var inputEventCallback = function inputEventCallback(value) {
                return inputEvent(value);
            };
            // Validate input and then call original 'onChange / onBlur...' event from input field
            _this.validate(inputValue, function () {
                return inputEventCallback(inputValue);
            });

            return inputValue;
        };

        _this.onChange = function (e) {
            return _this._onChange(e, _this.getInputOnChange());
        };

        _this.onBlur = function () {
            return _this._onChange(_this.getInputValue(), _this.getInputOnBlur());
        };

        _this.validate = function (inputValue) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            // Trigger validation on others fields if needed
            if (_this.props.triggerFields) {
                ValidationActions.forceValidateFields(_isArray(_this.props.triggerFields) ? _this.props.triggerFields : [_this.props.triggerFields]);
            }

            // Apply some conversion for special cases to fit async-validate expectations
            inputValue = _this.convertSpecialCases(inputValue);
            // Validate field and display error message if needed
            ValidationStore.validateField(_this.props.name, inputValue, function (errors) {
                // setTimeout is used as a trick here to avoid asynchronous issues (browser is moving caret to the end of the field
                // because we're changing the state here and in the child component)
                var firstError = errors ? errors[0].message : undefined;
                setTimeout(function () {
                    _this.props.onError(firstError); // Call 'onError' callback
                    if (_this._isMounted) _this.setState({ error: firstError, isValid: !firstError }); // Only display the first error
                }, 0);
            });
            // Always call 'callback' to avoid issue with asynchronous validation (jumping caret)
            callback();
        };

        _this.errorMessage = function (msg, params) {
            // Replace first param (= name of the field)
            params[0] = Config.ERROR_MESSAGE_FIELD_NAME;
            // Replace each parameter with his corresponding value
            _map(params, function (p) {
                return msg = msg.replace("%s", p);
            });

            return msg;
        };

        _this.convertValidatorRule = function (rule) {
            // Convert a simple validator
            if (rule.validator) {
                return function (callback) {
                    var errorCallback = this.raise.bind(this);
                    rule.validator(this.value, errorCallback);
                    callback();
                };
                // Convert an asyncValidator
            } else if (rule.asyncValidator) {
                return function (callback) {
                    var _this2 = this;

                    // Create a simpler way to trigger error message when 'callback' will be called
                    var triggerCallback = function triggerCallback(error) {
                        if (error) _this2.raise(error);
                        callback();
                    };
                    rule.asyncValidator(this.value, triggerCallback);
                };
                // Ignore rule
            } else {
                return rule;
            }
        };

        _this.convertValue = function (inputValue) {
            var convertedValue = inputValue;
            // Try to convert input value according to his rule's type
            // TODO RCH : maybe it can be improved by using "transform" property from async-validate lib
            if (_this.hasRuleType("integer")) convertedValue = ValidationUtils.toInteger(inputValue);else if (_this.hasRuleType("float") || _this.hasRuleType("number")) convertedValue = ValidationUtils.toFloat(inputValue);else if (_this.hasRuleType("string")) convertedValue = ValidationUtils.toString(inputValue);else if (_this.hasRuleType("boolean")) convertedValue = ValidationUtils.toBoolean(inputValue);

            return convertedValue;
        };

        _this.convertSpecialCases = function (inputValue) {
            if (_isEmpty(inputValue) && (_this.hasRuleType("array") || _this.hasRuleType("object"))) return undefined;else return inputValue;
        };

        _this.forceValidate = function (group) {
            // Validate current field only if it belongs to asked group
            if (_this.props.group === group) _this.validate(_this.convertValue(_this.getInputValue()));
        };

        _this.forceValidateFromFields = function (fieldNames /*:array*/) {
            // Validate this input only if it appears into list of fields to validate
            if (_find(fieldNames, function (name) {
                return name === _this.props.name;
            })) _this.validate(_this.convertValue(_this.getInputValue()));
        };

        _this.showCharsLeft = function () {
            return _this.props.showCharsLeft;
        };

        _this.showIcons = function () {
            return _this.props.showIcons && !_this.isSelect() && !_this.isCheckbox() && !_this.isTextarea();
        };

        _this.showLabel = function () {
            return _this.props.label;
        };

        _this.className = function () {
            return classnames("validation-field", _this.props.className, {
                "validation-field--error": _this.state.error,
                "validation-field--success": _this.state.isValid,
                "validation-field--with-icons": _this.showLabel(), // Hide icon by default field is a Select / checkbox
                "validation-field--with-count": _this.showCharsLeft(), // Hide icon by default field is a Select / checkbox
                "validation-field--date-picker": _this.isDatePicker(), // Add a different class for date-picker
                "validation-field--checkbox": _this.isCheckbox() // Add a different class for checkbox
            });
        };

        _this.renderError = function () {
            return Responsive.isTablet() ? _this.state.error ? React.createElement(
                'div',
                { className: 'validation-field__error-message' },
                _this.state.error
            ) : null : React.createElement(
                Tooltip,
                { id: _this.props.name, effect: 'solid', 'class': 'validation-field__tooltip', html: true },
                _this.state.error
            );
        };

        _this.renderCharsLeft = function () {
            var value = _this.getInputValue();
            var count = value && value.length ? value.length : 0;
            var maxChars = _this.getRule("max");
            var charsLeft = count >= maxChars ? 0 : maxChars - count;
            var threshold = _this.props.charsLeftThreshold ? _this.props.charsLeftThreshold(charsLeft, maxChars) : Config.CHARS_LEFT_THRESHOLD(charsLeft, maxChars);
            // If threshold has been reached, do not display any message about remaining chars
            if (!threshold) return;

            var charsLeftMessage = _this.props.charsLeftMessage ? _this.props.charsLeftMessage(charsLeft) : Config.COUNT_MESSAGE(charsLeft);

            return React.createElement(
                'div',
                { className: 'validation-field__chars-left' },
                charsLeftMessage
            );
        };

        _this.renderIcon = function () {
            if (_this.state.error || _this.state.isValid) {
                var iconClass = _this.state.error ? _this.props.iconErrorClass || Config.ICON_ERROR_CLASS : _this.state.isValid ? _this.props.iconValidClass || Config.ICON_VALID_CLASS : "";

                return React.createElement('i', { className: 'validation-field__icon ' + iconClass });
            } else {
                return null;
            }
        };

        _this.renderLabel = function () {
            return React.createElement('label', { className: 'validation-field__label', dangerouslySetInnerHTML: { __html: _this.props.label } });
        };

        _this.render = function () {
            if (!_this.getInput() || _isArray(_this.getInput())) {
                console.error('ValidationField with name \'' + _this.props.name + '\' need to have exactly one child');
                return null;
            }
            if (_this.showCharsLeft() && _isUndefined(_this.getRule("max"))) console.error('ValidationField with name \'' + _this.props.name + '\' should declare \'max\' rule because \'showCharsLeft\' is defined');

            // Clone children input and attach 'onChange' function in order to validate/convert data
            var onChange = { onChange: _this.onChange, id: _this.props.name };
            var onBlur = _this.props.triggerOnBlur ? _this.isDatePicker() ? // Exception for DatePicker
            { inputProps: _merge(_this.getInput().props.inputProps, { onBlur: _this.onBlur }) } : { onBlur: _this.onBlur } : {};

            var newProps = _merge(onChange, onBlur);
            var input = React.cloneElement(_this.getInput(), newProps);

            var tooltipProps = {
                "data-tip": "",
                "data-for": _this.props.name,
                "data-event": "mouseenter touchstart click",
                "data-event-off": "mouseleave",
                "data-iscapture": true // Will propagates all events in data-event
            };

            return React.createElement(
                'div',
                { className: _this.className() },
                _this.showLabel() ? _this.renderLabel() : null,
                React.createElement(
                    'div',
                    _extends({ className: 'validation-field__input-wrapper' }, tooltipProps),
                    input,
                    _this.showIcons() ? _this.renderIcon() : null
                ),
                _this.showCharsLeft() ? _this.renderCharsLeft() : null,
                _this.renderError()
            );
        };

        _this.state = {
            error: undefined,
            isValid: undefined
        };
        _this._isMounted = false;
        _this.listenToAction(ValidationActions.validateAllFields, _this.forceValidate);
        _this.listenToAction(ValidationActions.forceValidateFields, _this.forceValidateFromFields);
        return _this;
    }

    _createClass(ValidationField, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this3 = this;

            this._isMounted = true;
            // Check if input children contains a valid prop to get his value
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
                    var ruleType = ruleTypeIndex !== -1 ? rules[ruleTypeIndex].type : "string";
                    //let ruleIndexToUpdate = requiredRuleIndex !== -1 ? requiredRuleIndex : ruleTypeIndex;
                    var ruleIndexToUpdate = ruleTypeIndex !== -1 ? ruleTypeIndex : requiredRuleIndex;

                    // Update or add "required" rule which is the result of the merge between new rule and old rule
                    var newRequiredRule = _merge({ required: true, whitespace: true, type: ruleType, message: this.errorMessage }, rules[ruleIndexToUpdate]);
                    if (ruleTypeIndex === -1 && requiredRuleIndex === -1) {
                        rules.push(newRequiredRule);
                    } else {
                        rules.splice(ruleIndexToUpdate, 1, newRequiredRule);
                    }
                    // Need to convert validators from { validator: fn } to fn
                    // During schema validation, async-validate will automatically call these function validators
                    rules = _map(rules, function (rule) {
                        return _this3.convertValidatorRule(rule);
                    });
                } else {
                    // Just merge current rule with default one
                    rules = _merge({ required: true, whitespace: true, type: "string", message: this.errorMessage }, rules);
                }
                // When component is mounted, add it to ValidationStore so it must be able to validate this particular field
                ValidationStore.addField(this.props.name, rules, this.props.group);
            } else {
                console.error('Field with name \'' + this.props.name + '\' should have one of these props : ' + _keys(SUPPORTED_VALUE_PROPS));
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            // Will call RefluxListener.componentWillUnmount and stop listening to actions
            _get2(ValidationField.prototype.__proto__ || Object.getPrototypeOf(ValidationField.prototype), 'componentWillUnmount', this).call(this);
            this._isMounted = false;
            // When component is unmounted, remove it from ValidationStore because this field should not be validated anymore
            ValidationStore.removeField(this.props.name);
        }

        // Look into child props to check if it provides one of supported values
        // Get input value depending on input child


        // TODO RCH : use SUPPORTED_VALUE_PROPS if possible
        // Event blur will not return any target value so we return input value directly

        /**
         * Convert a validator rule to an async-validate function rule
         * Ex: it will convert {validator: fn} to fn
         */


        // TODO RCH : ideally, we should return "" instead of undefined to avoid warning in the console


        /**
         * Some special cases must be covered to fit async-validate expectations
         * - validate a required object with "null" will return true
         * - validate a required array with "[]" will return true
         */

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
    name: React.PropTypes.string.isRequired,
    group: React.PropTypes.string, // If set, this field will be isolated into a "group" of fields
    label: React.PropTypes.string,
    rules: React.PropTypes.oneOfType([React.PropTypes.arrayOf(React.PropTypes.object), React.PropTypes.object]).isRequired, // List of rules, see https://github.com/tmpfs/async-validate#rules
    triggerFields: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.string]), // Field or list of fields for which validation should be triggered when this component is changing
    onError: React.PropTypes.func,
    triggerOnBlur: React.PropTypes.bool, // If true, validation will be triggered during onBlur event as well
    showCharsLeft: React.PropTypes.bool, // If true, display number of remaining chars. A 'max' rule must be set.
    charsLeftMessage: React.PropTypes.func, // Message to display when 'showCharsLeft' property is true (can be configured as well in Config.COUNT_MESSAGE)
    charsLeftThreshold: React.PropTypes.func, // Threshold before displaying chars left message (can be configured as well in Config.CHARS_LEFT_THRESHOLD)
    showIcons: React.PropTypes.bool, // If true, display an icon according to field's validity
    iconValidClass: React.PropTypes.string, // Icon class to apply when field is valid (this option can be globally set in Configuration.js as well)
    iconErrorClass: React.PropTypes.string, // Icon class to apply when field is not valid (this option can be globally set in Configuration.js as well)
    className: React.PropTypes.string // Additional class name
};

module.exports = ValidationField;