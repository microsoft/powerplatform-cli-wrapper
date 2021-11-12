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
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["solution", "import"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--path", parameters.path, (value) => path.resolve(runnerParameters.workingDir, value));
            validator.pushInput(pacArgs, "--async", parameters.async);
            validator.pushInput(pacArgs, "--import-as-holding", parameters.importAsHolding);
            validator.pushInput(pacArgs, "--force-overwrite", parameters.forceOverwrite);
            validator.pushInput(pacArgs, "--publish-changes", parameters.publishChanges);
            validator.pushInput(pacArgs, "--skip-dependency-check", parameters.skipDependencyCheck);
            validator.pushInput(pacArgs, "--convert-to-managed", parameters.convertToManaged);
            validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);
            validator.pushInput(pacArgs, "--activate-plugins", parameters.activatePlugins);
            if (validator.getInput(parameters.useDeploymentSettingsFile) === "true") {
                validator.pushInput(pacArgs, "--settings-file", parameters.deploymentSettingsFile);
            }
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("ImportSolution Action Result: " + pacResult);
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
exports.importSolution = importSolution;

//# sourceMappingURL=importSolution.js.map
