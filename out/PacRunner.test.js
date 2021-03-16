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
const chai_1 = require("chai");
const src_1 = require("../src");
const path = require("path");
const fs = require("fs-extra");
const createTestLogger_1 = require("./createTestLogger");
describe("PacAccess", () => {
    const workDir = path.resolve(__dirname, "..", "out", "test");
    const pacPath = path.resolve(__dirname, "..", "bin", "pac", "tools", "pac.exe");
    const pac = src_1.createPacRunner(workDir, pacPath, createTestLogger_1.createTestLog("pac-tests.log"));
    before(() => {
        fs.emptyDirSync(workDir);
    });
    it("can launch pac help screen", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield pac.help();
        chai_1.expect(res).to.be.not.null;
        chai_1.expect(res).to.be.not.empty;
    })).timeout(10 * 1000);
    it("can run org who am i", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield pac.org.who();
        chai_1.expect(response).to.be.not.empty;
    })).timeout(5000);
    it("can list auth profiles", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield pac.auth.list();
        chai_1.expect(res).to.be.not.empty;
    })).timeout(30 * 1000);
});

//# sourceMappingURL=PacRunner.test.js.map
