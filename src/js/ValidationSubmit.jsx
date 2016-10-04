const React = require('react');
const { RefluxComponent } = require("react-commons");
const _ = require("lodash");

const ValidationStore = require('./stores/ValidationStore');

// TODO RCH : add a spinner icon on this component until validation is not over
class ValidationSubmit extends RefluxComponent {

    constructor(props) {
        super(props);

        this.state = { };
        this.listenToStore(ValidationStore, this.onSuccess)
    }

    _cleanProps = () => {
        let newProps = _.clone(this.props);
        delete newProps.onClick;
        delete newProps.onSuccess;
        delete newProps.renderFactory;

        return newProps;
    };

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

    render = () => {
        let newProps = _.merge(this._cleanProps(), { onClick: this.submit });

        return this.props.renderFactory ?
            this.props.renderFactory(newProps) :
            <button {...newProps} onClick={this.submit}/>;
    }

}

ValidationSubmit.defaultProps = {
    onClick: () => {}
};

ValidationSubmit.propTypes = {
    onClick:        React.PropTypes.func,
    onSuccess:      React.PropTypes.func.isRequired,
    renderFactory:  React.PropTypes.func
};

module.exports = ValidationSubmit;
