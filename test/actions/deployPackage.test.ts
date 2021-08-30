import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import { DeployPackageParameters } from "src/actions/deployPackage";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: deploy package", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let deployPackageParameters: DeployPackageParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    deployPackageParameters = createDeployPackageParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(deployPackageParameters: DeployPackageParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/deployPackage"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });
    await mockedActionModule.deployPackage(deployPackageParameters, runnerParameters, host);
  }

  const createDeployPackageParameters = (): DeployPackageParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    packagePath: { name: "SolutionInputFile", required: true },
    logFile: { name: "LogFile", required: false },
    logConsole: { name: "LogConsole", required: false },
    maxAsyncWaitTimeInMin: { name: "MaxAsyncWaitTime", required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(deployPackageParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", host.absoluteSolutionPath, "--max-async-wait-time", "60");
  });

  it("with minimal inputs and with all optional inputs, calls pac runner with correct args", async () => {
    deployPackageParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: true, defaultValue: '180' };
    deployPackageParameters.logFile = { name: 'LogDataFile', required: true, defaultValue: '' };
    deployPackageParameters.logConsole = { name: 'LogConsole', required: true, defaultValue: false };

    await runActionWithMocks(deployPackageParameters);

    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", host.absoluteSolutionPath, "--max-async-wait-time", host.maxAsyncWaitTime,
    "--logFile", host.logDataFile, "--logConsole", "true", );
  });

  it("with minimal inputs and with all optional inputs, calls pac runner with correct args", async () => {
    deployPackageParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: false, defaultValue: '180' };

    await runActionWithMocks(deployPackageParameters);

    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", host.absoluteSolutionPath, "--max-async-wait-time", "180");
  });
});
