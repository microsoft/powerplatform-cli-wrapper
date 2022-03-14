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
exports.uploadPaportal = void 0;
const InputValidator_1 = require("../host/InputValidator");
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
function uploadPaportal(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = runnerParameters.logger;
        const pac = createPacRunner_1.default(runnerParameters);
        try {
            const authenticateResult = yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
            logger.log("The Authentication Result: " + authenticateResult);
            const pacArgs = ["paportal", "upload"];
            const validator = new InputValidator_1.InputValidator(host);
            validator.pushInput(pacArgs, "--path", parameters.path);
            validator.pushInput(pacArgs, "--deploymentProfile", parameters.deploymentProfile);
            logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
            const pacResult = yield pac(...pacArgs);
            logger.log("UploadPaPortal Action Result: " + pacResult);
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
exports.uploadPaportal = uploadPaportal;

//# sourceMappingURL=uploadPaportal.js.map
