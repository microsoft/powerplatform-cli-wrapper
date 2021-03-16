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
const chai_1 = require("chai");
const src_1 = require("../src");
const createTestLogger_1 = require("./createTestLogger");
const fs_extra_1 = require("fs-extra");
describe("git", () => {
    const workDir = path.resolve(__dirname, "..", "out", "test");
    fs_extra_1.emptyDirSync(workDir);
    const git = src_1.createGitRunner(workDir, createTestLogger_1.createTestLog("git-tests.log"));
    it("can launch git log", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const logs = yield git.log();
        const firstCommit = (_a = logs.pop()) === null || _a === void 0 ? void 0 : _a.trimStart();
        chai_1.expect(firstCommit).to.match(/commit\s+[0-9a-z]{7,}/);
    }));
});

//# sourceMappingURL=GitRunner.test.js.map
