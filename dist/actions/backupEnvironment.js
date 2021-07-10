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
exports.backupEnvironment = void 0;
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
function backupEnvironment(parameters, runnerParameters, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const pac = createPacRunner_1.default(runnerParameters);
        yield authenticate_1.authenticateAdmin(pac, parameters.credentials);
        // Made environment url mandatory and removed environment id as there are planned changes in PAC CLI on the parameter.
        const pacArgs = ["admin", "backup", "--url", parameters.environmentUrl];
        const backupLabel = host.getInput(parameters.backupLabel);
        if (backupLabel === undefined) {
            //This error should never occur
            throw new Error("Label is undefined, it must always be set by host.");
        }
        pacArgs.push("--label", backupLabel);
        yield pac(...pacArgs);
    });
}
exports.backupEnvironment = backupEnvironment;

//# sourceMappingURL=backupEnvironment.js.map