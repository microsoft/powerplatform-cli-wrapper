"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidator = void 0;
class InputValidator {
    constructor(host) {
        this._host = host;
    }
    getInput(params) {
        const val = this._host.getInput(params);
        if (val === undefined && params.defaultValue !== undefined) {
            return params.defaultValue.toString();
        }
        return val;
    }
    pushInput(pacArgs, property, params, callback) {
        if (params !== undefined) {
            let val = this.getInput(params);
            if (val === undefined && params.required) {
                throw new Error(`Required ${params.name} not set`);
            }
            else if (val !== undefined) {
                if (callback) {
                    val = callback(val);
                }
                pacArgs.push(property, val);
            }
        }
    }
    //deprecated
    getBoolInput(params) {
        const textValue = this._host.getInput(params);
        const boolValue = (!textValue) ? (typeof params.defaultValue === 'boolean' ? params.defaultValue : false) : textValue === 'true';
        return boolValue.toString();
    }
    //deprecated
    getIntInput(params) {
        const defaultValue = (typeof params.defaultValue === 'string') ? parseInt(params.defaultValue) : 60;
        const textValue = this._host.getInput(params);
        if (textValue !== undefined) {
            if (parseInt(textValue) > 0 && parseFloat(textValue) === parseInt(textValue)) {
                return textValue;
            }
            else {
                throw new Error(`${textValue} is not a valid positive number`);
            }
        }
        return defaultValue.toString();
    }
    //deprecated
    isEntryValid(entry) {
        return entry !== undefined && entry.name !== undefined && entry.required !== undefined;
    }
}
exports.InputValidator = InputValidator;

//# sourceMappingURL=InputValidator.js.map
