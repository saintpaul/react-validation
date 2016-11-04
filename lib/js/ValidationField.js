"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require("react-commons"),
    RefluxComponent = _require.RefluxComponent;

var classnames = require("classnames");
var _ = require('lodash');

var ValidationUtils = require('./utils/ValidationUtils');

var ValidationStore = require('./stores/ValidationStore');
var ValidationActions = require('./actions/ValidationActions');

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
            return _.find(_.keys(_this.getInput().props), function (propKey) {
                return _.includes(_.keys(SUPPORTED_VALUE_PROPS), propKey);
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
            return _.get(_this.props.rules, rule) || _.get(_.find(_this.props.rules, function (r) {
                return _.has(r, rule);
            }), rule);
        };

        _this.hasRuleType = function (ruleType) {
            return _.find(_this.props.rules, function (rule) {
                return rule === ruleType || rule.type === ruleType;
            });
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
            return _.isArray(_this.props.rules);
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

        _this.onBlur = function (e) {
            return _this._onChange(_this.getInputValue(), _this.getInputOnBlur());
        };

        _this.validate = function (inputValue) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            // Trigger validation on others fields if needed
            if (_this.props.triggerFields) {
                ValidationActions.forceValidateFields(_.isArray(_this.props.triggerFields) ? _this.props.triggerFields : [_this.props.triggerFields]);
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
                    if (_this._isMounted) _this.setState({ error: firstError }); // Only display the first error
                }, 0);
            });
            // Always call 'callback' to avoid issue with asynchronous validation (jumping caret)
            callback();
        };

        _this.errorMessage = function (msg, params) {
            // Replace first param (= name of the field)
            params[0] = "This field";
            // Replace each parameter with his corresponding value
            _.map(params, function (p) {
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
            if (_.isEmpty(inputValue) && (_this.hasRuleType("array") || _this.hasRuleType("object"))) return undefined;else return inputValue;
        };

        _this.forceValidate = function () {
            _this.validate(_this.convertValue(_this.getInputValue()));
        };

        _this.forceValidateFromFields = function (fieldNames /*:array*/) {
            // Validate this input only if it appears into list of fields to validate
            if (_.find(fieldNames, function (name) {
                return name === _this.props.name;
            })) _this.validate(_this.convertValue(_this.getInputValue()));
        };

        _this.renderCount = function () {
            var value = _this.getInputValue();
            var count = value ? _this.hasRuleType("integer") ? value : value.length : 0;
            var maxCountReached = count >= _this.getRule("max");
            return React.createElement(
                "span",
                { className: classnames("validation-field-count", { "max-count-reached": maxCountReached }) },
                count
            );
        };

        _this.render = function () {
            if (!_this.props.children || _.isArray(_this.props.children)) {
                console.error("ValidationField with name '" + _this.props.name + "' need to have exactly one child");
                return null;
            }

            var newProps = _.merge({ onChange: _this.onChange }, _this.props.triggerOnBlur ? { onBlur: _this.onBlur } : {});
            var input = React.cloneElement(_this.getInput(), newProps);
            var inputWithLabel = React.createElement(
                "label",
                null,
                input,
                " ",
                React.createElement("span", { dangerouslySetInnerHTML: { __html: _this.props.label } }),
                " "
            );

            return React.createElement(
                "div",
                { className: classnames("validation-field", { "has-error": _this.state.error }) },
                _this.props.label ? inputWithLabel : input,
                _this.props.count ? _this.renderCount() : null,
                _this.state.error ? React.createElement("div", { className: "validation-field-error", dangerouslySetInnerHTML: { __html: _this.state.error } }) : null
            );
        };

        _this.state = {
            error: undefined
        };
        _this._isMounted = false;
        _this.listenToAction(ValidationActions.validateAllFields, _this.forceValidate);
        _this.listenToAction(ValidationActions.forceValidateFields, _this.forceValidateFromFields);
        return _this;
    }

    _createClass(ValidationField, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this3 = this;

            this._isMounted = true;
            // Check if input children contains a valid prop to get his value
            if (this.getValueProp()) {
                // Update rules by adding "required: true" and "whitespace: true" as default values (if not already set)
                var rules = _.cloneDeep(this.props.rules);
                if (this.rulesIsArray()) {
                    var requiredRuleIndex = _.findIndex(rules, function (rule) {
                        return _.has(rule, "required");
                    });
                    var ruleTypeIndex = _.findIndex(rules, function (rule) {
                        return _.has(rule, "type");
                    });
                    var ruleType = ruleTypeIndex !== -1 ? rules[ruleTypeIndex].type : "string";
                    //let ruleIndexToUpdate = requiredRuleIndex !== -1 ? requiredRuleIndex : ruleTypeIndex;
                    var ruleIndexToUpdate = ruleTypeIndex !== -1 ? ruleTypeIndex : requiredRuleIndex;

                    // Update or add "required" rule which is the result of the merge between new rule and old rule
                    var newRequiredRule = _.merge({ required: true, whitespace: true, type: ruleType, message: this.errorMessage }, rules[ruleIndexToUpdate]);
                    if (ruleTypeIndex === -1 && requiredRuleIndex === -1) {
                        rules.push(newRequiredRule);
                    } else {
                        rules.splice(ruleIndexToUpdate, 1, newRequiredRule);
                    }
                    // Need to convert validators from { validator: fn } to fn
                    // During schema validation, async-validate will automatically call these function validators
                    rules = _.map(rules, function (rule) {
                        return _this3.convertValidatorRule(rule);
                    });
                } else {
                    // Just merge current rule with default one
                    rules = _.merge({ required: true, whitespace: true, type: "string", message: this.errorMessage }, rules);
                }
                // When component is mounted, add it to ValidationStore so it must be able to validate this particular field
                ValidationStore.addField(this.props.name, rules);
            } else {
                console.error("Field with name '" + this.props.name + "' should have one of these props : " + _.keys(SUPPORTED_VALUE_PROPS));
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            // Will call RefluxListener.componentWillUnmount and stop listening to actions
            _get(ValidationField.prototype.__proto__ || Object.getPrototypeOf(ValidationField.prototype), "componentWillUnmount", this).call(this);
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
    count: false
};

ValidationField.propTypes = {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    rules: React.PropTypes.oneOfType([React.PropTypes.arrayOf(React.PropTypes.object), React.PropTypes.object]).isRequired, // List of rules, see https://github.com/tmpfs/async-validate#rules
    triggerFields: React.PropTypes.oneOfType([React.PropTypes.array, React.PropTypes.string]), // Field or list of field for which validation should be triggered when this component is changing
    onError: React.PropTypes.func,
    triggerOnBlur: React.PropTypes.bool, // If true, validation will be triggered during onBlur event as well
    count: React.PropTypes.bool // If true, display a counter on the field.
};

module.exports = ValidationField;