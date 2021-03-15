import { expect } from "chai";
import { PacRunner } from "../src";
import path = require("path");
import fs = require("fs-extra");
import { TestLog } from "./testLog";

describe("PacAccess", () => {
  const workDir = path.resolve(__dirname, "..", "out", "test");
  const pac = new PacRunner(workDir, new TestLog("pac-tests.log"));

  before(() => {
    fs.emptyDirSync(workDir);
  });

  it("can launch pac help screen", async () => {
    const res = await pac.run([]);
    expect(res).to.be.not.null;
    expect(res).to.be.not.empty;
  }).timeout(10 * 1000);

  it("can list auth profiles", async () => {
    const res = await pac.run(["auth", "list"]);
    expect(res).to.be.not.empty;
  }).timeout(30 * 1000);
});
