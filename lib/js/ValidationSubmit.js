"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require("react-commons");

var RefluxComponent = _require.RefluxComponent;

var _ = require("lodash");

var ValidationStore = require('./stores/ValidationStore');

// TODO RCH : add a spinner icon on this component until validation is not over

var ValidationSubmit = function (_RefluxComponent) {
    _inherits(ValidationSubmit, _RefluxComponent);

    function ValidationSubmit(props) {
        _classCallCheck(this, ValidationSubmit);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ValidationSubmit).call(this, props));

        _this._cleanProps = function () {
            var newProps = _.clone(_this.props);
            delete newProps.onClick;
            delete newProps.onSuccess;
            delete newProps.renderFactory;

            return newProps;
        };

        _this.onSuccess = function (errors) {
            _this.props.onSuccess(errors);
        };

        _this.submit = function (e) {
            e.preventDefault();
            _this.props.onClick();
            ValidationStore.validateAllFields();

            //Case where a form has dynamic field and suddenly has no field to validate but need to be submitted
            if (Object.keys(ValidationStore.fields).length === 0) _this.props.onSuccess();
        };

        _this.render = function () {
            var newProps = _this._cleanProps();

            return _this.props.renderFactory ? _this.props.renderFactory(_.merge(newProps, { onClick: _this.submit })) : React.createElement("button", _extends({}, newProps, { onClick: _this.submit }));
        };

        _this.state = {};
        _this.listenToStore(ValidationStore, _this.onSuccess);
        return _this;
    }

    return ValidationSubmit;
}(RefluxComponent);

ValidationSubmit.defaultProps = {
    onClick: function onClick() {}
};

ValidationSubmit.propsType = {
    onClick: React.PropTypes.func,
    onSuccess: React.PropTypes.func.isRequired,
    renderFactory: React.PropTypes.func
};

module.exports = ValidationSubmit;