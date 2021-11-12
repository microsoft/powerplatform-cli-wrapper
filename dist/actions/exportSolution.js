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
exports.exportSolution = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
const path = require("path");
function exportSolution(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["solution", "export"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--name", parameters.name);
            validator.pushInput(pacArgs, "--path", parameters.path, (value) => path.resolve(runnerParameters.workingDir, value));
            validator.pushInput(pacArgs, "--managed", parameters.managed);
            validator.pushInput(pacArgs, "--async", parameters.async);
            validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);
            validator.pushInput(pacArgs, "--targetversion", parameters.targetVersion);
            const includeArgs = [];
            if (validator.getInput(parameters.autoNumberSettings) === 'true') {
                includeArgs.push("autonumbering");
            }
            if (validator.getInput(parameters.calenderSettings) === 'true') {
                includeArgs.push("calendar");
            }
            if (validator.getInput(parameters.customizationSettings) === 'true') {
                includeArgs.push("customization");
            }
            if (validator.getInput(parameters.emailTrackingSettings) === 'true') {
                includeArgs.push("emailtracking");
            }
            if (validator.getInput(parameters.externalApplicationSettings) === 'true') {
                includeArgs.push("externalapplications");
            }
            if (validator.getInput(parameters.generalSettings) === 'true') {
                includeArgs.push("general");
            }
            if (validator.getInput(parameters.isvConfig) === 'true') {
                includeArgs.push("isvconfig");
            }
            if (validator.getInput(parameters.marketingSettings) === 'true') {
                includeArgs.push("marketing");
            }
            if (validator.getInput(parameters.outlookSynchronizationSettings) === 'true') {
                includeArgs.push("outlooksynchronization");
            }
            if (validator.getInput(parameters.relationshipRoles) === 'true') {
                includeArgs.push("relationshiproles");
            }
            if (validator.getInput(parameters.sales) === 'true') {
                includeArgs.push("sales");
            }
            if (includeArgs.length > 0) {
                pacArgs.push("--include", includeArgs.join(','));
            }
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("ExportSolution Action Result: " + pacResult);
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
exports.exportSolution = exportSolution;

//# sourceMappingURL=exportSolution.js.map
