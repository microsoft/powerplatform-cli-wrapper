import path = require("path");
import { expect } from "chai";
import { createGitRunner } from "../src";
import { TestLog } from "./testLog";

describe("git", () => {
  const workDir = path.resolve(__dirname, "..", "out", "test");
  const git = createGitRunner(workDir, new TestLog("git-tests.log"));

  it("can launch git log", async () => {
    const logs = await git.run(["log"]);
    const firstCommit = logs.pop()?.trimStart();
    expect(firstCommit).to.match(/commit\s+[0-9a-z]{7,}/);
  });
});
