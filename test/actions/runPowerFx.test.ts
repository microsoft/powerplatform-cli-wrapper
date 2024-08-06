import { expect } from "chai";
import { stub, SinonStub } from "sinon";
import { runPowerFx } from "../../src/actions/runPowerFx";
import { createPacRunner, authenticateEnvironment, clearAuthentication } from "../../src/pac";
import { RunPowerFxParameters } from "../../src/actions/runPowerFx";
import { RunnerParameters } from "../../src/Parameters";
import { mockHost } from "./mock/mockHost";
import { createMockClientCredentials, createDefaultMockRunnerParameters, mockEnvironmentUrl } from "./mock/mockData";

describe("runPowerFx", () => {
  let createPacRunnerStub: SinonStub;
  let authenticateEnvironmentStub: SinonStub;
  let clearAuthenticationStub: SinonStub;

  beforeEach(() => {
    createPacRunnerStub = stub(createPacRunner, "default");
    authenticateEnvironmentStub = stub(authenticateEnvironment, "default");
    clearAuthenticationStub = stub(clearAuthentication, "default");
  });

  afterEach(() => {
    createPacRunnerStub.restore();
    authenticateEnvironmentStub.restore();
    clearAuthenticationStub.restore();
  });

  it("should run PowerFx successfully", async () => {
    const parameters: RunPowerFxParameters = {
      credentials: createMockClientCredentials(),
      environment: { name: "environment", required: true, value: mockEnvironmentUrl },
      file: { name: "file", required: true, value: "path/to/file" },
    };

    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const host = new mockHost();

    createPacRunnerStub.returns({
      run: stub().resolves("PowerFx run successfully"),
    });

    authenticateEnvironmentStub.resolves("Authenticated successfully");
    clearAuthenticationStub.resolves("Cleared authentication successfully");

    const result = await runPowerFx(parameters, runnerParameters, host);

    expect(result).to.equal("PowerFx run successfully");
    expect(authenticateEnvironmentStub.calledOnce).to.be.true;
    expect(createPacRunnerStub.calledOnce).to.be.true;
    expect(clearAuthenticationStub.calledOnce).to.be.true;
  });

  it("should handle errors during PowerFx run", async () => {
    const parameters: RunPowerFxParameters = {
      credentials: createMockClientCredentials(),
      environment: { name: "environment", required: true, value: mockEnvironmentUrl },
      file: { name: "file", required: true, value: "path/to/file" },
    };

    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const host = new mockHost();

    createPacRunnerStub.returns({
      run: stub().rejects(new Error("PowerFx run failed")),
    });

    authenticateEnvironmentStub.resolves("Authenticated successfully");
    clearAuthenticationStub.resolves("Cleared authentication successfully");

    try {
      await runPowerFx(parameters, runnerParameters, host);
    } catch (error) {
      expect(error.message).to.equal("PowerFx run failed");
    }

    expect(authenticateEnvironmentStub.calledOnce).to.be.true;
    expect(createPacRunnerStub.calledOnce).to.be.true;
    expect(clearAuthenticationStub.calledOnce).to.be.true;
  });
});
