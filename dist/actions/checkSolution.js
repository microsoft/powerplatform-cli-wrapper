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
exports.checkSolution = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
const path = require("path");
function checkSolution(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        const validator = new InputValidator_1.InputValidator(host);
        let level;
        let threshold;
        if (parameters.errorLevel != undefined && parameters.errorThreshold != undefined) {
            level = validator.getInput(parameters.errorLevel);
            threshold = validator.getInput(parameters.errorThreshold);
        }
        try {
            const authenticateResult = yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["solution", "check"];
            if (parameters.fileLocation != undefined && validator.getInput(parameters.fileLocation) === 'sasUriFile') {
                validator.pushInput(pacArgs, "--solutionUrl", parameters.solutionUrl);
            }
            else {
                validator.pushInput(pacArgs, "--path", parameters.solutionPath, (value) => path.resolve(runnerParameters.workingDir, value));
            }
            validator.pushInput(pacArgs, "--geo", parameters.geoInstance);
            validator.pushInput(pacArgs, "--ruleSet", parameters.ruleSet);
            validator.pushInput(pacArgs, "--ruleLevelOverride", parameters.ruleLevelOverride);
            validator.pushInput(pacArgs, "--outputDirectory", parameters.outputDirectory);
            validator.pushInput(pacArgs, "--excludedFiles", parameters.filesExcluded);
            if (parameters.useDefaultPAEndpoint != undefined && validator.getInput(parameters.useDefaultPAEndpoint) === 'true') {
                pacArgs.push("--customEndpoint", parameters.environmentUrl);
            }
            else {
                validator.pushInput(pacArgs, "--customEndpoint", parameters.customPAEndpoint);
            }
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            //pacResult is not in any contractual format. It is an array similar to the one in checkSolution.test.ts
            const pacResult = yield pac(...pacArgs);
            logger.log("CheckSolution Action Result: " + pacResult);
            const status = pacResult[pacResult.length - 7].split(' ')[2];
            if (status === 'Failed' || status === 'FinishedWithErrors') {
                throw new Error("PowerApps Checker analysis results indicate a failure or error during the analysis process.");
            }
            if (level != undefined && threshold != undefined) {
                errorCheck(pacResult, level, parseInt(threshold));
            }
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
exports.checkSolution = checkSolution;
function errorCheck(pacResults, errorLevel, errorThreshold) {
    const errors = {};
    const PAErrorLevels = pacResults[pacResults.length - 5].trim().split(/\s+/);
    const PAErrorValues = pacResults[pacResults.length - 3].trim().split(/\s+/);
    for (let i = 0; i < PAErrorLevels.length && i < PAErrorValues.length; i++) {
        errors[PAErrorLevels[i]] = parseInt(PAErrorValues[i]);
    }
    const issueCount = {
        "CriticalIssueCount": "Critical",
        "HighIssueCount": "High",
        "MediumIssueCount": "Medium",
        "LowIssueCount": "Low",
        "InformationalIssueCount": "Informational"
    };
    if (errors[issueCount[errorLevel]] > errorThreshold) {
        throw new Error("Analysis results do not pass with selected error level and threshold choices.  Please review detailed results in SARIF file for more information.");
    }
}

//# sourceMappingURL=checkSolution.js.map
