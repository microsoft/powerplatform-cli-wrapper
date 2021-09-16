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
        const pac = createPacRunner_1.default(runnerParameters);
        yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
        const pacArgs = ["solution", "export"];
        const validator = new InputValidator_1.InputValidator(host);
        const solutionName = host.getInput(parameters.name);
        if (solutionName === undefined) {
            // This error should never occur
            throw new Error("Solution name is undefined, it must always be set by host.");
        }
        pacArgs.push("--name", solutionName);
        const solutionPath = host.getInput(parameters.path);
        if (solutionPath === undefined) {
            // This error should never occur
            throw new Error("Solution path is undefined, it must always be set by host.");
        }
        pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));
        pacArgs.push("--managed", validator.getBoolInput(parameters.managed));
        pacArgs.push("--async", validator.getBoolInput(parameters.async));
        pacArgs.push("--max-async-wait-time", validator.getIntInput(parameters.maxAsyncWaitTimeInMin));
        const targetVersion = host.getInput(parameters.targetVersion);
        if (targetVersion !== undefined) {
            pacArgs.push("--targetversion", targetVersion);
        }
        const includeArgs = [];
        if (validator.getBoolInput(parameters.autoNumberSettings) === 'true') {
            includeArgs.push("autonumbering");
        }
        if (validator.getBoolInput(parameters.calenderSettings) === 'true') {
            includeArgs.push("calendar");
        }
        if (validator.getBoolInput(parameters.customizationSettings) === 'true') {
            includeArgs.push("customization");
        }
        if (validator.getBoolInput(parameters.emailTrackingSettings) === 'true') {
            includeArgs.push("emailtracking");
        }
        if (validator.getBoolInput(parameters.externalApplicationSettings) === 'true') {
            includeArgs.push("externalapplications");
        }
        if (validator.getBoolInput(parameters.generalSettings) === 'true') {
            includeArgs.push("general");
        }
        if (validator.getBoolInput(parameters.isvConfig) === 'true') {
            includeArgs.push("isvconfig");
        }
        if (validator.getBoolInput(parameters.marketingSettings) === 'true') {
            includeArgs.push("marketing");
        }
        if (validator.getBoolInput(parameters.outlookSynchronizationSettings) === 'true') {
            includeArgs.push("outlooksynchronization");
        }
        if (validator.getBoolInput(parameters.relationshipRoles) === 'true') {
            includeArgs.push("relationshiproles");
        }
        if (validator.getBoolInput(parameters.sales) === 'true') {
            includeArgs.push("sales");
        }
        if (includeArgs.length > 0) {
            pacArgs.push("--include", includeArgs.join(','));
        }
        yield pac(...pacArgs);
    });
}
exports.exportSolution = exportSolution;

//# sourceMappingURL=exportSolution.js.map
