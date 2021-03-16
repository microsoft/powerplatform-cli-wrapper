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
const path = require("path");
const fs = require("fs-extra");
const chai_1 = require("chai");
const src_1 = require("../src");
const createTestLogger_1 = require("./createTestLogger");
describe("SoPa", () => {
    const workDir = path.resolve(__dirname, "..", "out", "test");
    const sopaExePath = path.resolve(__dirname, "..", "bin", "sopa", "content", "bin", "coretools", "SolutionPackager.exe");
    const sopa = src_1.createSopaRunner(workDir, sopaExePath, createTestLogger_1.createTestLog("sopa-tests.log"));
    before(() => {
        fs.emptyDirSync(workDir);
    });
    it("can launch SoPa help screen", () => __awaiter(void 0, void 0, void 0, function* () {
        sopa
            .help()
            .then(() => {
            chai.assert.fail();
        })
            .catch((err) => {
            chai_1.expect(err).to.be.a("Error").with.property("exitCode", 2);
        });
    }));
    it("can pack solution", () => __awaiter(void 0, void 0, void 0, function* () {
        const solutionPath = path.resolve(workDir, "emptySolution.zip");
        const stagedDir = path.resolve(__dirname, "data", "emptySolution");
        const res = yield sopa.pack(stagedDir, solutionPath);
        chai_1.expect(res).to.contain("Unmanaged Pack complete.");
    })).timeout(20 * 1000);
});

//# sourceMappingURL=SopaRunner.test.js.map
