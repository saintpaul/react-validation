'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require("react-commons"),
    RefluxComponent = _require.RefluxComponent;

var _clone = require('lodash/clone');
var _merge = require('lodash/merge');

var ValidationStore = require('./stores/ValidationStore');

// TODO RCH : add a spinner icon on this component until validation is not over

var ValidationSubmit = function (_RefluxComponent) {
    _inherits(ValidationSubmit, _RefluxComponent);

    function ValidationSubmit(props) {
        _classCallCheck(this, ValidationSubmit);

        var _this = _possibleConstructorReturn(this, (ValidationSubmit.__proto__ || Object.getPrototypeOf(ValidationSubmit)).call(this, props));

        _this._cleanProps = function () {
            var newProps = _clone(_this.props);
            delete newProps.onClick;
            delete newProps.onSuccess;
            delete newProps.renderFactory;
            delete newProps.errorMessage;
            delete newProps.group;

            return newProps;
        };

        _this.onSuccess = function (_ref) {
            var errors = _ref.errors,
                group = _ref.group;

            if (group === _this.props.group) {
                var hasErrors = errors && errors.length > 0;
                _this.setState({ hasError: hasErrors });
                _this.props.onSuccess(hasErrors ? errors : undefined);
            }
        };

        _this.submit = function (e) {
            e.preventDefault();
            _this.props.onClick();
            ValidationStore.validateAllFields(_this.props.group);

            //Case where a form has dynamic field and suddenly has no field to validate but need to be submitted
            if (Object.keys(ValidationStore.fields).length === 0) _this.props.onSuccess();
        };

        _this.renderButton = function (newProps) {
            return React.createElement(
                'div',
                { className: 'validation-submit' },
                React.createElement('button', _extends({}, newProps, { onClick: _this.submit })),
                _this.state.hasError ? React.createElement(
                    'div',
                    { className: 'validation-submit__error' },
                    newProps.errorMessage
                ) : null
            );
        };

        _this.render = function () {
            var newProps = _merge(_this._cleanProps(), { onClick: _this.submit });

            return _this.props.renderFactory ? _this.props.renderFactory(newProps, _this.state.hasError) : _this.renderButton(newProps);
        };

        _this.state = {
            hasError: false
        };
        _this.listenToStore(ValidationStore, _this.onSuccess);
        return _this;
    }

    return ValidationSubmit;
}(RefluxComponent);

ValidationSubmit.defaultProps = {
    onClick: function onClick() {},
    errorMessage: "Some fields are incorrect, please review them."
};

ValidationSubmit.propTypes = {
    group: React.PropTypes.string, // If set, it will only validate all fields that belongs to this group
    onClick: React.PropTypes.func,
    onSuccess: React.PropTypes.func.isRequired,
    renderFactory: React.PropTypes.func,
    errorMessage: React.PropTypes.string
};

module.exports = ValidationSubmit;