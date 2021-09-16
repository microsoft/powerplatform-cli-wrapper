"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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
exports.importSolution = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
const path = require("path");
function importSolution(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const pac = createPacRunner_1.default(runnerParameters);
        yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
        const pacArgs = ["solution", "import"];
        const validator = new InputValidator_1.InputValidator(host);
        const solutionPath = host.getInput(parameters.path);
        if (solutionPath === undefined) {
            // This error should never occur
            throw new Error("Solution path is undefined, it must always be set by host.");
        }
        pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));
        pacArgs.push("--async", validator.getBoolInput(parameters.async));
        pacArgs.push("--import-as-holding", validator.getBoolInput(parameters.importAsHolding));
        pacArgs.push("--force-overwrite", validator.getBoolInput(parameters.forceOverwrite));
        pacArgs.push("--publish-changes", validator.getBoolInput(parameters.publishChanges));
        pacArgs.push("--skip-dependency-check", validator.getBoolInput(parameters.skipDependencyCheck));
        pacArgs.push("--convert-to-managed", validator.getBoolInput(parameters.convertToManaged));
        pacArgs.push("--max-async-wait-time", validator.getIntInput(parameters.maxAsyncWaitTimeInMin));
        pacArgs.push("--activate-plugins", validator.getBoolInput(parameters.activatePlugins));
        if (validator.getBoolInput(parameters.useDeploymentSettingsFile) === "true") {
            if (parameters.deploymentSettingsFile) {
                const settingsFile = host.getInput(parameters.deploymentSettingsFile);
                if (settingsFile !== undefined)
                    pacArgs.push("--settings-file", settingsFile);
            }
        }
        yield pac(...pacArgs);
    });
}
exports.importSolution = importSolution;

//# sourceMappingURL=importSolution.js.map
