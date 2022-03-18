"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetEnvironment = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
const createEnvironment_1 = require("../actions/createEnvironment");
function resetEnvironment(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateAdmin(pac, parameters.credentials);
            logger.log("The Authentication Result: " + authenticateResult);
            // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
            const pacArgs = ["admin", "reset"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--environment", parameters.environment);
            validator.pushInput(pacArgs, "--url", parameters.environmentUrl);
            validator.pushInput(pacArgs, "--environment-id", parameters.environmentId);
            validator.pushInput(pacArgs, "--language", parameters.language);
            validator.pushInput(pacArgs, "--currency", parameters.currency);
            validator.pushInput(pacArgs, "--purpose", parameters.purpose);
            validator.pushInput(pacArgs, "--templates", parameters.templates);
            if (validator.getInput(parameters.overrideDomainName) === 'true') {
                validator.pushInput(pacArgs, "--domain", parameters.domainName);
            }
            if (validator.getInput(parameters.overrideFriendlyName) === 'true') {
                validator.pushInput(pacArgs, "--name", parameters.friendlyEnvironmentName);
            }
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("ResetEnvironment Action Result: " + pacResult);
            // HACK TODO: Need structured output from pac CLI to make parsing out of the resulting env URL more robust
            const envResult = createEnvironment_1.getEnvironmentDetails(pacResult);
            return envResult;
        }
        catch (error) {
            logger.error(`failed: ${error.message}`);
            throw error;
        }
        finally {
            const clearAuthResult = yield authenticate_1.clearAuthentication(pac);
            logger.log("The Clear Authentication Result: " + clearAuthResult);
        }
    });
}
exports.resetEnvironment = resetEnvironment;

//# sourceMappingURL=resetEnvironment.js.map
