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
exports.getEnvironmentDetails = exports.createEnvironment = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
function createEnvironment(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateAdmin(pac, parameters.credentials);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["admin", "create"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--name", parameters.environmentName);
            validator.pushInput(pacArgs, "--type", parameters.environmentType);
            validator.pushInput(pacArgs, "--templates", parameters.templates);
            validator.pushInput(pacArgs, "--region", parameters.region);
            validator.pushInput(pacArgs, "--currency", parameters.currency);
            validator.pushInput(pacArgs, "--language", parameters.language);
            validator.pushInput(pacArgs, "--domain", parameters.domainName);
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("CreateEnvironment Action Result: " + pacResult);
            // HACK TODO: Need structured output from pac CLI to make parsing out of the resulting env URL more robust
            const envResult = getEnvironmentDetails(pacResult);
            return envResult;
        }
        catch (error) {
            logger.error(`failed: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
        finally {
            const clearAuthResult = yield authenticate_1.clearAuthentication(pac);
            logger.log("The Clear Authentication Result: " + clearAuthResult);
        }
    });
}
exports.createEnvironment = createEnvironment;
function getEnvironmentDetails(pacResult) {
    var _a;
    const newEnvDetailColumns = (_a = pacResult
        .filter(l => l.length > 0)
        .pop()) === null || _a === void 0 ? void 0 : _a.trim().split(/\s+/);
    const envUrl = newEnvDetailColumns === null || newEnvDetailColumns === void 0 ? void 0 : newEnvDetailColumns.shift();
    const envId = newEnvDetailColumns === null || newEnvDetailColumns === void 0 ? void 0 : newEnvDetailColumns.shift();
    return {
        environmentId: envId,
        environmentUrl: envUrl
    };
}
exports.getEnvironmentDetails = getEnvironmentDetails;

//# sourceMappingURL=createEnvironment.js.map
