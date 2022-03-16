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
exports.packSolution = void 0;
const InputValidator_1 = require("../host/InputValidator");
const createPacRunner_1 = require("../pac/createPacRunner");
const path = require("path");
function packSolution(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const pacArgs = ["solution", "pack"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--zipFile", parameters.solutionZipFile, (value) => path.resolve(runnerParameters.workingDir, value));
            validator.pushInput(pacArgs, "--folder", parameters.sourceFolder, (value) => path.resolve(runnerParameters.workingDir, value));
            validator.pushInput(pacArgs, "--packageType", parameters.solutionType);
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("PackSolution Action Result: " + pacResult);
        }
        catch (error) {
            logger.error(`failed: ${error.message}`);
            throw error;
        }
    });
}
exports.packSolution = packSolution;

//# sourceMappingURL=packSolution.js.map