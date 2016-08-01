const _ = require("lodash");


class ValidationUtils {

    static toInteger(input) {
        if (ValidationUtils.isEmpty(input))
            return undefined;

        var num = Number(input);
        if (!isNaN(num))
            num = parseInt(input);

        return isNaN(num) ? input : num;
    }

    static toFloat(input) {
        if (ValidationUtils.isEmpty(input))
            return undefined;

        var num = input;
        if(_.isNumber(input)) {
            num = input.toString();
        }

        // Need to perform this regexp to avoid parseFloat() to convert xx. to xx
        if(/^\-?[0-9]+\.?[0-9]*$/.test(num)) {
            if(num.endsWith(".") || num.endsWith(".0")) {
                return num;
            } else {
                return parseFloat(num);
            }
        } else {
            return num;
        }
    }

    static toString(input) {
        if (ValidationUtils.isEmpty(input))
            return undefined;

        var string = input;
        if(_.isString(string)) {
            string = input.toString();
        }
        return string;
    }

    static toBoolean(input) {
        return input === "true" || input === true;
    }

    static isEmpty(input) {
        return _.isNull(input) || _.isUndefined(input) || input === "";
    }

}

module.exports = ValidationUtils;