import * as sinonChai from "sinon-chai";
import { should, use } from "chai";
import { promises as fs } from "fs";
import { createPacRuntimeEnvironment, withPacRuntimeEnvironment, withPacRuntimeParameters } from "../../src/pac/runtimeEnvironment";
import { RunnerParameters } from "../../src/Parameters";
import testLogger from "../testLogger";

should();
use(sinonChai);

describe("PAC runtime environment", () => {
  it("creates unique request roots without mutating the parent environment", async () => {
    const originalHome = process.env.HOME;
    const [first, second] = await Promise.all([
      createPacRuntimeEnvironment(),
      createPacRuntimeEnvironment(),
    ]);

    try {
      const firstUserProfile = first.environment.USERPROFILE;
      const firstHome = first.environment.HOME;
      const secondUserProfile = second.environment.USERPROFILE;
      if (!firstUserProfile || !firstHome || !secondUserProfile) {
        throw new Error("PAC runtime environment variables were not created");
      }
      first.root.should.not.equal(second.root);
      firstUserProfile.should.equal(first.root);
      firstHome.should.equal(`${first.root}\\home`);
      secondUserProfile.should.equal(second.root);
      if (process.env.HOME !== originalHome) {
        throw new Error("The parent HOME environment was mutated");
      }
      (await fs.stat(first.root)).isDirectory().should.equal(true);
      (await fs.stat(second.root)).isDirectory().should.equal(true);
    } finally {
      await Promise.all([first.cleanup(), second.cleanup()]);
    }
  });

  it("cleans up idempotently", async () => {
    const runtime = await createPacRuntimeEnvironment();
    await runtime.cleanup();
    await runtime.cleanup();
    let exists = true;
    try {
      await fs.stat(runtime.root);
    } catch {
      exists = false;
    }
    exists.should.equal(false);
  });

  it("shares concurrent cleanup calls", async () => {
    const runtime = await createPacRuntimeEnvironment("pac-concurrent-cleanup-");
    await Promise.all(Array.from({ length: 16 }, () => runtime.cleanup()));
    let exists = true;
    try {
      await fs.stat(runtime.root);
    } catch {
      exists = false;
    }
    exists.should.equal(false);
  });

  it("rejects path-affecting prefixes", async () => {
    let errorMessage = "";
    try {
      await createPacRuntimeEnvironment("..\\outside");
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
    errorMessage.should.contain("PAC runtime prefix");
  });

  it("cleans up when the request fails", async () => {
    let root = "";
    let errorMessage = "";
    try {
      await withPacRuntimeEnvironment(async runtime => {
        root = runtime.root;
        throw new Error("request failed");
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
    errorMessage.should.equal("request failed");

    let exists = true;
    try {
      await fs.stat(root);
    } catch {
      exists = false;
    }
    exists.should.equal(false);
  });

  it("merges a disposable runtime into runner parameters", async () => {
    const runnerParameters: RunnerParameters = {
      workingDir: process.cwd(),
      runnersDir: process.cwd(),
      logger: testLogger,
      agent: "test",
      pacEnvironment: { EXISTING_OVERRIDE: "retained" },
    };
    let root = "";

    await withPacRuntimeParameters(runnerParameters, async scopedParameters => {
      root = scopedParameters.pacEnvironment?.USERPROFILE ?? "";
      const environment = scopedParameters.pacEnvironment;
      if (!environment || !environment.EXISTING_OVERRIDE || !environment.USERPROFILE) {
        throw new Error("PAC runtime environment merge was incomplete");
      }
      environment.EXISTING_OVERRIDE.should.equal("retained");
      environment.USERPROFILE.should.equal(root);
    });

    let exists = true;
    try {
      await fs.stat(root);
    } catch {
      exists = false;
    }
    exists.should.equal(false);
  });
});
