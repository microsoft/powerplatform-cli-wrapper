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
exports.whoAmI = void 0;
const authenticate_1 = require("../pac/auth/authenticate");
const createPacRunner_1 = require("../pac/createPacRunner");
function whoAmI(parameters, runnerParameters) {
    return __awaiter(this, void 0, void 0, function* () {
        const pac = createPacRunner_1.default(runnerParameters);
        yield authenticate_1.authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
        yield pac("org", "who");
    });
}
exports.whoAmI = whoAmI;

//# sourceMappingURL=whoAmI.js.map
