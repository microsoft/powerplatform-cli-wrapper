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
exports.restoreEnvironment = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
const createEnvironment_1 = require("../actions/createEnvironment");
function restoreEnvironment(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateAdmin(pac, parameters.credentials);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["admin", "restore"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--source-env", parameters.sourceEnvironment);
            validator.pushInput(pacArgs, "--target-env", parameters.targetEnvironment);
            validator.pushInput(pacArgs, "--source-url", parameters.sourceEnvironmentUrl);
            validator.pushInput(pacArgs, "--target-url", parameters.targetEnvironmentUrl);
            validator.pushInput(pacArgs, "--source-id", parameters.sourceEnvironmentId);
            validator.pushInput(pacArgs, "--target-id", parameters.targetEnvironmentId);
            validator.pushInput(pacArgs, "--name", parameters.targetEnvironmentName);
            if (validator.getInput(parameters.restoreLatestBackup) === 'true') {
                pacArgs.push("--selected-backup", "latest");
            }
            else if (parameters.backupDateTime) {
                validator.pushInput(pacArgs, "--selected-backup", parameters.backupDateTime);
            }
            else {
                throw new Error("Either latest backup must be true or Valid date and time for backup must be provided.");
            }
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("RestoreEnvironment Action Result: " + pacResult);
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
exports.restoreEnvironment = restoreEnvironment;

//# sourceMappingURL=restoreEnvironment.js.map
