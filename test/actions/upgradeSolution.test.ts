import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { UpgradeSolutionParameters } from "src/actions/upgradeSolution";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: upgrade solution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let upgradeSolutionParameters: UpgradeSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    upgradeSolutionParameters = createUpgradeSolutionParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(upgradeSolutionParameters: UpgradeSolutionParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/upgradeSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });
    await mockedActionModule.upgradeSolution(upgradeSolutionParameters, runnerParameters, host);
  }

  const createUpgradeSolutionParameters = (): UpgradeSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    name: { name: 'SolutionName', required: true },
    async: { name: 'AsyncOperation', required: false },
    maxAsyncWaitTimeInMin: { name: 'MaxAsyncWaitTime', required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(upgradeSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("solution", "upgrade", "--solution-name", host.name);
  });

  it("with minimal inputs and with all optional inputs, calls pac runner with correct args", async () => {
    upgradeSolutionParameters.async = { name: 'AsyncOperation', required: true, defaultValue: true };
    upgradeSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: true, defaultValue: '180' };

    await runActionWithMocks(upgradeSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "upgrade", "--solution-name", host.name, "--async", 
      "true", "--max-async-wait-time", host.maxAsyncWaitTime);
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    upgradeSolutionParameters.async = { name: 'AsyncOperation', required: false, defaultValue: false };
    upgradeSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: false, defaultValue: '180' };

    await runActionWithMocks(upgradeSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "upgrade", "--solution-name", host.name, "--async", 
      "false", "--max-async-wait-time", "180");
  });
});
