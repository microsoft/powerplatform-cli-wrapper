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
exports.installApplication = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
const path = require("path");
function installApplication(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["application", "install"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--environment-id", parameters.environmentId);
            validator.pushInput(pacArgs, "--application-name", parameters.applicationName);
            validator.pushInput(pacArgs, "--application-list", parameters.applicationList, (value) => path.resolve(runnerParameters.workingDir, value));
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("Application Install Action Result: " + pacResult);
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
exports.installApplication = installApplication;

//# sourceMappingURL=installApplication.js.map