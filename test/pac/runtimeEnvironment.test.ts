import * as sinonChai from "sinon-chai";
import { should, use } from "chai";
import { promises as fs } from "fs";
import { join } from "path";
import { createPacRuntimeEnvironment, createPersistentPacRuntimeEnvironment, withPacRuntimeEnvironment, withPacRuntimeParameters, withPersistentPacRuntimeEnvironment, withPersistentPacRuntimeParameters } from "../../src/pac/runtimeEnvironment";
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
      firstHome.should.equal(join(first.root, "home"));
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

  it("retains persistent profile state across operations", async () => {
    const storeRoot = await fs.mkdtemp(join(process.cwd(), "pac-persistent-test-"));
    try {
      await withPersistentPacRuntimeEnvironment("customer-a", async runtime => {
        await fs.writeFile(join(runtime.root, "auth-state"), "stored");
      }, { storeRoot });

      await withPersistentPacRuntimeEnvironment("customer-a", async runtime => {
        (await fs.readFile(join(runtime.root, "auth-state"), "utf8")).should.equal("stored");
      }, { storeRoot });
    } finally {
      await fs.rm(storeRoot, { recursive: true, force: true });
    }
  });

  it("serializes callers sharing one persistent profile", async () => {
    const storeRoot = await fs.mkdtemp(join(process.cwd(), "pac-profile-lock-test-"));
    const first = await createPersistentPacRuntimeEnvironment("customer-a", { storeRoot });
    let secondAcquired = false;
    const secondPromise = createPersistentPacRuntimeEnvironment("customer-a", {
      storeRoot,
      lockTimeoutMs: 2000,
      lockRetryDelayMs: 10,
    }).then(runtime => {
      secondAcquired = true;
      return runtime;
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      secondAcquired.should.equal(false);
      await first.release();
      const second = await secondPromise;
      secondAcquired.should.equal(true);
      await second.release();
    } finally {
      await first.release();
      await fs.rm(storeRoot, { recursive: true, force: true });
    }
  });

  it("allows different persistent profiles to run concurrently", async () => {
    const storeRoot = await fs.mkdtemp(join(process.cwd(), "pac-profile-parallel-test-"));
    try {
      const [first, second] = await Promise.all([
        createPersistentPacRuntimeEnvironment("customer-a", { storeRoot }),
        createPersistentPacRuntimeEnvironment("customer-b", { storeRoot }),
      ]);
      first.root.should.not.equal(second.root);
      await Promise.all([first.release(), second.release()]);
    } finally {
      await fs.rm(storeRoot, { recursive: true, force: true });
    }
  });

  it("rejects path-affecting persistent profile keys", async () => {
    let errorMessage = "";
    try {
      await createPersistentPacRuntimeEnvironment("..\\outside");
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
    errorMessage.should.contain("PAC profile key");
  });

  it("merges a persistent runtime into runner parameters", async () => {
    const storeRoot = await fs.mkdtemp(join(process.cwd(), "pac-persistent-parameters-test-"));
    const runnerParameters: RunnerParameters = {
      workingDir: process.cwd(),
      runnersDir: process.cwd(),
      logger: testLogger,
      agent: "test",
      pacEnvironment: { EXISTING_OVERRIDE: "retained" },
    };

    try {
      await withPersistentPacRuntimeParameters("customer-a", runnerParameters, async scopedParameters => {
        const environment = scopedParameters.pacEnvironment;
        if (!environment?.USERPROFILE || !environment.EXISTING_OVERRIDE) {
          throw new Error("Persistent PAC runtime environment merge was incomplete");
        }
        environment.EXISTING_OVERRIDE.should.equal("retained");
        environment.USERPROFILE.should.equal(join(storeRoot, "customer-a"));
      }, { storeRoot });
    } finally {
      await fs.rm(storeRoot, { recursive: true, force: true });
    }
  });
});
