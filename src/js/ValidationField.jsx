const React = require('react');
const RefluxComponent = require("react-reflux-component");
const classnames = require("classnames");
const _ = require('lodash');

const ValidationUtils = require('./utils/ValidationUtils');

const ValidationStore = require('./stores/ValidationStore');
const ValidationActions = require('./actions/ValidationActions');

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
            error: undefined
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
    onBlur = (e) => this._onChange(e, this.getInputOnBlur());

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
                if(this._isMounted) this.setState({error: firstError}); // Only display the first error
            }, 0);
        });
        // Always call 'callback' to avoid issue with asynchronous validation (jumping caret)
        callback();
    };

    errorMessage = (msg, params) => {
        // Replace first param (= name of the field)
        params[0] = "This field";
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

    convertValue = (inputValue) => {
        var convertedValue = inputValue;
        // Try to convert input value according to his rule's type
        // TODO RCH : maybe it can be improved by using "transform" property from async-validate lib
        if(this.rulesIsArray()) {
            if (_.find(this.props.rules, (rule) => rule.type === "integer"))
                convertedValue = ValidationUtils.toInteger(inputValue);
            else if (_.find(this.props.rules, (rule) => rule.type === "float" || rule.type === "number"))
                convertedValue = ValidationUtils.toFloat(inputValue);
            else if (_.find(this.props.rules, (rule) => rule.type === "string"))
                convertedValue = ValidationUtils.toString(inputValue);
            else if (_.find(this.props.rules, (rule) => rule.type === "boolean"))
                convertedValue = ValidationUtils.toBoolean(inputValue);
        } else {
            if (this.props.rules.type === "integer")
                convertedValue = ValidationUtils.toInteger(inputValue);
            else if (this.props.rules.type === "float" || this.props.rules.type === "number")
                convertedValue = ValidationUtils.toFloat(inputValue);
            else if (this.props.rules.type === "string")
                convertedValue = ValidationUtils.toString(inputValue);
            else if (this.props.rules.type === "boolean")
                convertedValue = ValidationUtils.toBoolean(inputValue);
        }

        return convertedValue;
    };

    /**
     * Some special cases must be covered to fit async-validate expectations
     * - validate a required object with "null" will return true
     * - validate a required array with "[]" will return true
     */
    convertSpecialCases = (inputValue) => {
        var convertedValue = inputValue;
        if (this.rulesIsArray()) {
            if (_.find(this.props.rules, (rule) => rule.type === "array") && _.isEmpty(inputValue) ||
               (_.find(this.props.rules, (rule) => rule.type === "object") && _.isEmpty(inputValue)))
                convertedValue = undefined
        } else {
            if (this.props.rules.type === "array" && _.isEmpty(inputValue) ||
               (this.props.rules.type === "object" && _.isEmpty(inputValue)))
                convertedValue = undefined;
        }
        return convertedValue;
    };

    forceValidate = () => {
        this.validate(this.convertValue(this.getInputValue()));
    };

    forceValidateFromFields = (fieldNames/*:array*/) => {
        // Validate this input only if it appears into list of fields to validate
        if(_.find(fieldNames, (name) => name === this.props.name))
            this.validate(this.convertValue(this.getInputValue()));
    };

    render = () => {
        if(!this.props.children || _.isArray(this.props.children)) {
            console.error(`ValidationField with name '${this.props.name}' need to have exactly one child`);
            return null;
        }

        var newProps = _.merge(
            { onChange : this.onChange },
            this.props.onBlur   ? { onBlur  : this.onBlur } : {},
            this.state.error    ? { bsStyle : "error" } : {}
        );
        let input = React.cloneElement(this.getInput(), newProps);
        let inputWithLabel = <label>{ input } <span dangerouslySetInnerHTML={{__html: this.props.label }}/> </label>;

        return (
            <div className={classnames({"has-error": this.state.error})}>
                { this.props.label ? inputWithLabel : input }
                { this.state.error ?
                    <div className="validation-field-error">
                        { this.state.error }
                    </div> : null
                }
            </div>
        )
    };
}

ValidationField.defaultProps = {
    rules: {},
    onError : () => {},
    onBlur: false
};

ValidationField.propTypes = {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    rules: React.PropTypes.oneOfType([ React.PropTypes.arrayOf(React.PropTypes.object), React.PropTypes.object ]).isRequired, // List of rules, see
    triggerFields: React.PropTypes.oneOfType([ React.PropTypes.array, React.PropTypes.string ]), // Field or list of field for which validation should be triggered when this component is changing
    onError: React.PropTypes.func,
    onBlur: React.PropTypes.bool // If true, validation will be triggered during onBlur event as well
};

module.exports = ValidationField;
