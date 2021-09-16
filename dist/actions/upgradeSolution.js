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
exports.upgradeSolution = void 0;
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
function upgradeSolution(parameters, runnerParameters) {
    return __awaiter(this, void 0, void 0, function* () {
        const pac = createPacRunner_1.default(runnerParameters);
        yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
        const upgradeArgs = ["solution", "upgrade", "--solution-name", parameters.name];
        if (parameters.async) {
            upgradeArgs.push("--async");
        }
        if (parameters.maxAsyncWaitTimeInMin) {
            upgradeArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString());
        }
        yield pac(...upgradeArgs);
    });
}
exports.upgradeSolution = upgradeSolution;

//# sourceMappingURL=upgradeSolution.js.map
