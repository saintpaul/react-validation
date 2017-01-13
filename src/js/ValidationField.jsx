const React = require('react');
const classnames = require("classnames");
const _ = require('lodash');

const { RefluxComponent } = require("react-commons");
const Tooltip = require("react-tooltip");

const ValidationUtils = require('./utils/ValidationUtils');
const Responsive = require('./utils/Responsive');
const ValidationTypes = require('./ValidationTypes');

const ValidationStore = require('./stores/ValidationStore');
const ValidationActions = require('./actions/ValidationActions');

const Config = require("./Configuration");

const SUPPORTED_VALUE_PROPS = {
    value: "value",         // For all inputs text / other components
    checked: "checked",     // For checkboxes
    dateTime: "dateTime"    // For datetime picker
};

/**
 * ValidationField
 * Wraps an input field and apply some rules on it. According to rules, it will display an error message.
 * This component is based on https://github.com/tmpfs/async-validate project
 */
class ValidationField extends RefluxComponent {

    constructor(props) {
        super(props);

        this.state = {
            error: undefined,
            isValid: undefined
        };
        this._isMounted = false;
        this.listenToAction(ValidationActions.validateAllFields, this.forceValidate);
        this.listenToAction(ValidationActions.forceValidateFields, this.forceValidateFromFields);
    }

    componentDidMount() {
        this._isMounted = true;
        // Check if input children contains a valid prop to get his value
        if(this.getValueProp()) {
            // Update rules by adding "required: true" and "whitespace: true" as default values (if not already set)
            var rules = _.cloneDeep(this.props.rules);
            if(this.rulesIsArray()) {
                let requiredRuleIndex = _.findIndex(rules, (rule) => _.has(rule, "required"));
                let ruleTypeIndex = _.findIndex(rules, (rule) => _.has(rule, "type"));
                let ruleType = ruleTypeIndex !== -1 ? rules[ruleTypeIndex].type : "string";
                //let ruleIndexToUpdate = requiredRuleIndex !== -1 ? requiredRuleIndex : ruleTypeIndex;
                let ruleIndexToUpdate = ruleTypeIndex !== -1 ? ruleTypeIndex : requiredRuleIndex;

                // Update or add "required" rule which is the result of the merge between new rule and old rule
                var newRequiredRule = _.merge({ required: true, whitespace: true, type: ruleType, message: this.errorMessage }, rules[ruleIndexToUpdate]);
                if(ruleTypeIndex === -1 && requiredRuleIndex === -1) {
                    rules.push(newRequiredRule);
                } else {
                    rules.splice(ruleIndexToUpdate, 1, newRequiredRule);
                }
                // Need to convert validators from { validator: fn } to fn
                // During schema validation, async-validate will automatically call these function validators
                rules = _.map(rules, (rule) => this.convertValidatorRule(rule));
            } else {
                // Just merge current rule with default one
                rules = _.merge({ required: true, whitespace: true, type: "string", message: this.errorMessage }, rules);
            }
            // When component is mounted, add it to ValidationStore so it must be able to validate this particular field
            ValidationStore.addField(this.props.name, rules);
        } else {
            console.error(`Field with name '${this.props.name}' should have one of these props : ${_.keys(SUPPORTED_VALUE_PROPS)}`)
        }
    }

    componentWillUnmount() {
        // Will call RefluxListener.componentWillUnmount and stop listening to actions
        super.componentWillUnmount();
        this._isMounted = false;
        // When component is unmounted, remove it from ValidationStore because this field should not be validated anymore
        ValidationStore.removeField(this.props.name);
    }

    // Look into child props to check if it provides one of supported values
    getValueProp = () => _.find(_.keys(this.getInput().props), (propKey) => _.includes(_.keys(SUPPORTED_VALUE_PROPS), propKey));
    getInput = () => this.props.children;
    getInputValue = () => this.getInput().props[this.getValueProp()]; // Get input value depending on input child
    getInputOnChange = () => this.getInput().props.onChange;
    getInputOnBlur = () => this.getInput().props.onBlur;
    getRule = (rule) => _.get(this.props.rules, rule) || _.get(_.find(this.props.rules, (r) => _.has(r, rule)), rule);
    hasRuleType = (ruleType) => _.find(this.props.rules, (rule) => rule === ruleType || rule.type === ruleType);
    isSelect = () => this.getInput().props.validationType === ValidationTypes.REACT_SELECT;
    isDatePicker = () => this.getInput().props.validationType === ValidationTypes.REACT_DATEPICKER;
    isCheckbox = () => this.getInput().props.type === ValidationTypes.CHECKBOX;

    // TODO RCH : use SUPPORTED_VALUE_PROPS if possible
    getInputValueFromEvent = (e) => {
        if(e && e.target) {
            if(e.target.checked) {
                return e.target.checked;
            } else {
                return e.target.value;
            }
        } else {
            return e;
        }
    };

    rulesIsArray = () => _.isArray(this.props.rules);

    _onChange = (e, inputEvent = () => {}) => {
        var inputValue = this.convertValue(this.getInputValueFromEvent(e));
        let inputEventCallback = (value) => inputEvent(value);
        // Validate input and then call original 'onChange / onBlur...' event from input field
        this.validate(inputValue, () => inputEventCallback(inputValue));

        return inputValue;
    };

    onChange = (e) => this._onChange(e, this.getInputOnChange());
    onBlur = (e) => this._onChange(this.getInputValue(), this.getInputOnBlur()); // Event blur will not return any target value so we return input value directly

    validate = (inputValue, callback = () => { } ) => {
        // Trigger validation on others fields if needed
        if(this.props.triggerFields) {
            ValidationActions.forceValidateFields(_.isArray(this.props.triggerFields) ? this.props.triggerFields : [this.props.triggerFields]);
        }

        // Apply some conversion for special cases to fit async-validate expectations
        inputValue = this.convertSpecialCases(inputValue);
        // Validate field and display error message if needed
        ValidationStore.validateField(this.props.name, inputValue, (errors) => {
            // setTimeout is used as a trick here to avoid asynchronous issues (browser is moving caret to the end of the field
            // because we're changing the state here and in the child component)
            let firstError = errors ? errors[0].message : undefined;
            setTimeout(() => {
                this.props.onError(firstError); // Call 'onError' callback
                if(this._isMounted) this.setState({error: firstError, isValid: !firstError}); // Only display the first error
            }, 0);
        });
        // Always call 'callback' to avoid issue with asynchronous validation (jumping caret)
        callback();
    };

    errorMessage = (msg, params) => {
        // Replace first param (= name of the field)
        params[0] = Config.ERROR_MESSAGE_FIELD_NAME;
        // Replace each parameter with his corresponding value
        _.map(params, p => msg = msg.replace("%s", p));

        return msg;
    };

    /**
     * Convert a validator rule to an async-validate function rule
     * Ex: it will convert {validator: fn} to fn
     */
    convertValidatorRule = (rule) => {
        // Convert a simple validator
        if(rule.validator) {
            return function(callback) {
                var errorCallback = this.raise.bind(this);
                rule.validator(this.value, errorCallback);
                callback();
            };
        // Convert an asyncValidator
        } else if(rule.asyncValidator) {
            return function(callback) {
                // Create a simpler way to trigger error message when 'callback' will be called
                var triggerCallback = (error) => {
                    if(error) this.raise(error);
                    callback();
                };
                rule.asyncValidator(this.value, triggerCallback);
            };
        // Ignore rule
        } else {
            return rule;
        }
    };

    // TODO RCH : ideally, we should return "" instead of undefined to avoid warning in the console
    convertValue = (inputValue) => {
        var convertedValue = inputValue;
        // Try to convert input value according to his rule's type
        // TODO RCH : maybe it can be improved by using "transform" property from async-validate lib
        if(this.hasRuleType("integer"))
            convertedValue = ValidationUtils.toInteger(inputValue);
        else if(this.hasRuleType("float") || this.hasRuleType("number"))
            convertedValue = ValidationUtils.toFloat(inputValue);
        else if(this.hasRuleType("string"))
            convertedValue = ValidationUtils.toString(inputValue);
        else if(this.hasRuleType("boolean"))
            convertedValue = ValidationUtils.toBoolean(inputValue);

        return convertedValue;
    };

    /**
     * Some special cases must be covered to fit async-validate expectations
     * - validate a required object with "null" will return true
     * - validate a required array with "[]" will return true
     */
    convertSpecialCases = (inputValue) => {
        if (_.isEmpty(inputValue) && (this.hasRuleType("array") || this.hasRuleType("object")))
            return undefined;
        else
            return inputValue;
    };

    forceValidate = () => {
        this.validate(this.convertValue(this.getInputValue()));
    };

    forceValidateFromFields = (fieldNames/*:array*/) => {
        // Validate this input only if it appears into list of fields to validate
        if(_.find(fieldNames, (name) => name === this.props.name))
            this.validate(this.convertValue(this.getInputValue()));
    };

    showCharsLeft = () => this.props.showCharsLeft;
    showIcons = () => this.props.showIcons && !this.isSelect() && !this.isCheckbox();
    showLabel = () => this.props.label;

    className = () => classnames("validation-field", this.props.className, {
        "validation-field--error": this.state.error,
        "validation-field--success": this.state.isValid,
        "validation-field--with-icons": this.showLabel(), // Hide icon by default field is a Select / checkbox
        "validation-field--with-count": this.showCharsLeft(), // Hide icon by default field is a Select / checkbox
        "validation-field--date-picker": this.isDatePicker(), // Add a different class for date-picker
        "validation-field--checkbox": this.isCheckbox() // Add a different class for checkbox
    });

    renderError = () => Responsive.isTablet() ?
        this.state.error ? <div className="validation-field__error-message">{ this.state.error }</div> : null :
        <Tooltip id={this.props.name} effect="solid" class="validation-field__tooltip" html>{ this.state.error }</Tooltip>;

    renderCharsLeft = () => {
        let value = this.getInputValue();
        let count = value ? this.hasRuleType("integer") ? value : value.length : 0;
        let charsLeft = count >= this.getRule("max") ? 0 : this.getRule("max") - count;

        let charsLeftMessage = this.props.charsLeftMessage ? this.props.charsLeftMessage(charsLeft) : Config.COUNT_MESSAGE(charsLeft);

        return <div className="validation-field__chars-left">{ charsLeftMessage }</div>
    };

    renderIcon = () => {
        if(this.state.error || this.state.isValid) {
            let iconClass = this.state.error ?
                this.props.iconErrorClass || Config.ICON_ERROR_CLASS : this.state.isValid ?
                this.props.iconValidClass || Config.ICON_VALID_CLASS : "";

            return <i className={`validation-field__icon ${iconClass}`}/>;
        } else {
            return null;
        }
    };

    renderLabel = () => (
        <label className="validation-field__label" dangerouslySetInnerHTML={{__html: this.props.label }}/>
    );

    render = () => {
        if(!this.getInput() || _.isArray(this.getInput())) {
            console.error(`ValidationField with name '${this.props.name}' need to have exactly one child`);
            return null;
        }
        if(this.showCharsLeft() && _.isUndefined(this.getRule("max")))
            console.error(`ValidationField with name '${this.props.name}' should declare 'max' rule because 'showCharsLeft' is defined`);

        // Clone children input and attach 'onChange' function in order to validate/convert data
        let onChange = { onChange : this.onChange, id: this.props.name };
        let onBlur = this.props.triggerOnBlur ?
            this.isDatePicker() ? // Exception for DatePicker
                { inputProps: _.merge(this.getInput().props.inputProps, { onBlur: this.onBlur }) } : { onBlur: this.onBlur } : {};

        let newProps = _.merge(onChange, onBlur);
        let input = React.cloneElement(this.getInput(), newProps);

        let tooltipProps = {
            "data-tip": "",
            "data-for": this.props.name,
            "data-event": "mouseenter touchstart click",
            "data-event-off": "mouseleave",
            "data-iscapture": true // Will propagates all events in data-event
        };

        return (
            <div className={this.className()}>
                { this.showLabel() ? this.renderLabel() : null }
                <div className="validation-field__input-wrapper" {...tooltipProps}>
                    { input }
                    { this.showIcons() ? this.renderIcon() : null }
                </div>
                { this.showCharsLeft() ? this.renderCharsLeft() : null }
                { this.renderError() }
            </div>
        )
    };
}

ValidationField.defaultProps = {
    rules: {},
    onError : () => {},
    onBlur: false,
    showCharsLeft: false,
    showIcons: true
};

ValidationField.propTypes = {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    rules: React.PropTypes.oneOfType([ React.PropTypes.arrayOf(React.PropTypes.object), React.PropTypes.object ]).isRequired, // List of rules, see https://github.com/tmpfs/async-validate#rules
    triggerFields: React.PropTypes.oneOfType([ React.PropTypes.array, React.PropTypes.string ]), // Field or list of fields for which validation should be triggered when this component is changing
    onError: React.PropTypes.func,
    triggerOnBlur: React.PropTypes.bool,        // If true, validation will be triggered during onBlur event as well
    showCharsLeft: React.PropTypes.bool,        // If true, display number of remaining chars. A 'max' rule must be set.
    charsLeftMessage: React.PropTypes.func,     // Message to display when 'showCharsLeft' property is true
    showIcons: React.PropTypes.bool,            // If true, display an icon according to field's validity
    iconValidClass: React.PropTypes.string,     // Icon class to apply when field is valid (this option can be globally set in Configuration.js as well)
    iconErrorClass: React.PropTypes.string,     // Icon class to apply when field is not valid (this option can be globally set in Configuration.js as well)
    className: React.PropTypes.string           // Additional class name
};

module.exports = ValidationField;
