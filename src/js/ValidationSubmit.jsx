const React = require('react');
const { RefluxComponent } = require("react-commons");
const _clone = require('lodash/clone');
const _merge = require('lodash/merge');

const ValidationStore = require('./stores/ValidationStore');

// TODO RCH : add a spinner icon on this component until validation is not over
class ValidationSubmit extends RefluxComponent {

    constructor(props) {
        super(props);

        this.state = {
            hasError: false
        };
        this.listenToStore(ValidationStore, this.onSuccess)
    }

    _cleanProps = () => {
        let newProps = _clone(this.props);
        delete newProps.onClick;
        delete newProps.onSuccess;
        delete newProps.renderFactory;
        delete newProps.errorMessage;
        delete newProps.group;

        return newProps;
    };

    onSuccess = ({errors, group}) => {
        if(group === this.props.group) {
            let hasErrors = errors && errors.length > 0;
            this.setState({ hasError: hasErrors });
            this.props.onSuccess(hasErrors ? errors : undefined);
        }
    };

    submit = (e) => {
        e.preventDefault();
        this.props.onClick();
        ValidationStore.validateAllFields(this.props.group);

        //Case where a form has dynamic field and suddenly has no field to validate but need to be submitted
        if(Object.keys(ValidationStore.fields).length === 0)
            this.props.onSuccess();
    };

    renderButton = (newProps) => (
        <div className="validation-submit">
            <button {...newProps} onClick={this.submit}/>
            { this.state.hasError ? <div className="validation-submit__error">{ newProps.errorMessage }</div> : null }
        </div>
    );

    render = () => {
        let newProps = _merge(this._cleanProps(), { onClick: this.submit });

        return this.props.renderFactory ? this.props.renderFactory(newProps, this.state.hasError) : this.renderButton(newProps);
    }

}

ValidationSubmit.defaultProps = {
    onClick: () => {},
    errorMessage: "Some fields are incorrect, please review them."
};

ValidationSubmit.propTypes = {
    group:          React.PropTypes.string,              // If set, it will only validate all fields that belongs to this group
    onClick:        React.PropTypes.func,
    onSuccess:      React.PropTypes.func.isRequired,
    renderFactory:  React.PropTypes.func,
    errorMessage:   React.PropTypes.string
};

module.exports = ValidationSubmit;
