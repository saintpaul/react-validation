"use strict";

var Reflux = require("reflux");

var ValidationActions = {
    validateAllFields: Reflux.createAction({ sync: true }),
    forceValidateFields: Reflux.createAction({ async: true })
};

module.exports = ValidationActions;