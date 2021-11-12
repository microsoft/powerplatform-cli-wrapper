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
    pushInput(pacArgs, property, paramEntry, callback) {
        // TODO: change action-specific ...Parameters contracts to always require the parameter definition
        // today, we double-encode if a task/action parameter is optional in the ...Parameters interface definition, but shouldn't!
        if (!paramEntry) {
            return;
        }
        let val = this.getInput(paramEntry);
        if (!val && paramEntry.required) {
            throw new Error(`Required ${paramEntry.name} not set`);
        }
        else if (val) {
            if (callback) {
                val = callback(val);
            }
            pacArgs.push(property, val);
        }
    }
}
exports.InputValidator = InputValidator;

//# sourceMappingURL=InputValidator.js.map
