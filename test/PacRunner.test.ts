import { expect } from "chai";
import { createPacRunner } from "../src";
import path = require("path");
import fs = require("fs-extra");
import { createTestLog } from "./createTestLogger";
import { platform } from "os";

describe("PacAccess", () => {
  const workDir = path.resolve(__dirname, "..", "bin", "test");
  const binDir = path.resolve(__dirname, "..", "bin");
  const pacPath = path.resolve(
    binDir,
    ...(platform() === "win32"
      ? ["pac", "tools", "pac.exe"]
      : ["pac_linux", "tools", "pac"])
  );
  const pac = createPacRunner(workDir, pacPath, createTestLog("pac-tests.log"));

  before(() => {
    fs.emptyDirSync(workDir);
  });

  it("can launch pac help screen", async () => {
    const res = await pac.help();
    expect(res).to.be.not.null;
    expect(res).to.be.not.empty;
  }).timeout(10 * 1000);

  it("can list auth profiles", async () => {
    const res = await pac.getAuthenticationProfiles();
    expect(res).to.be.not.empty;
  }).timeout(30 * 1000);
});
