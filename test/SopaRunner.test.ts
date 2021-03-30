import path = require("path");
import fs = require("fs-extra");
import { expect } from "chai";
import { createSopaRunner } from "../src/cli/SopaRunner";
import { createTestLog } from "./createTestLogger";
import { platform } from "os";

describe("SoPa", () => {
  if (platform() !== "win32") {
    return;
  }

  const workDir = path.resolve(__dirname, "..", "bin", "test");
  const sopaExePath = path.resolve(
    __dirname,
    "..",
    "bin",
    "sopa",
    "content",
    "bin",
    "coretools",
    "SolutionPackager.exe"
  );
  const sopa = createSopaRunner(
    workDir,
    sopaExePath,
    createTestLog("sopa-tests.log")
  );

  before(() => {
    fs.emptyDirSync(workDir);
  });

  it("can launch SoPa help screen", async () => {
    sopa
      .help()
      .then(() => {
        chai.assert.fail();
      })
      .catch((err: Error) => {
        expect(err).to.be.a("Error").with.property("exitCode", 2);
      });
  });

  it("can pack solution", async () => {
    const solutionPath = path.resolve(workDir, "emptySolution.zip");
    const stagedDir = path.resolve(__dirname, "data", "emptySolution");

    const res = await sopa.pack({ folder: stagedDir, zipFile: solutionPath });
    expect(res).to.contain("Unmanaged Pack complete.");
  }).timeout(30 * 1000);

  it("can unpack solution", async () => {
    const solutionPath = path.resolve(__dirname, "data", "emptySolution.zip");
    const stagedDir = path.resolve(workDir, "emptySolution");

    const response = await sopa.extract({
      folder: stagedDir,
      zipFile: solutionPath,
    });
    expect(response).to.contain("Unmanaged Extract complete.");
  }).timeout(30 * 1000);
});