import path = require("path");
import { expect } from "chai";
import { createGitRunner } from "../src/cli/GitRunner";
import { createTestLog } from "./createTestLogger";
import { emptyDirSync } from "fs-extra";

describe("git", () => {
  const workDir = path.resolve(__dirname, "..", "out", "test");
  emptyDirSync(workDir);
  const git = createGitRunner(workDir, createTestLog("git-tests.log"));

  it("can launch git log", async () => {
    const logs = await git.log(1);
    const line = logs.find((item) => item && item.startsWith("commit"));
    expect(line).to.match(/commit\s+[0-9a-z]{7,}/);
  });
});
