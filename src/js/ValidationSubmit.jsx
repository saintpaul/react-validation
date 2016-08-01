const React = require('react');
const aggregation = require("aggregation");

const RefluxListener = require('./utils/RefluxListener');
const ValidationStore = require('./stores/ValidationStore');

// TODO RCH : add a spinner icon on this component until validation is not over
class ValidationSubmit extends aggregation(React.Component, RefluxListener) {

    constructor(props) {
        super(props);

        this.state = { };
        this.listenToStore(ValidationStore, this.onSuccess)
    }

    onSuccess = (errors) => {
        this.props.onSuccess(errors);
    };

    submit = (e) => {
        e.preventDefault();
        this.props.onClick();
        ValidationStore.validateAllFields();

        //Case where a form has dynamic field and suddenly has no field to validate but need to be submitted
        if(Object.keys(ValidationStore.fields).length === 0)
            this.props.onSuccess();
    };

    render = () => (
        <button {...this.props} onClick={this.submit}/>
    );
}

ValidationSubmit.defaultProps = {
    onClick: () => {}
};

ValidationSubmit.propsType = {
    onClick:        React.PropTypes.func,
    onSuccess:      React.PropTypes.func.isRequired
};

module.exports = ValidationSubmit;
