/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import { DeployPackageParameters } from "src/actions/deployPackage";
import Sinon = require("sinon");
import { platform } from "os";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: deploy package", () => {
  let pacStub: CommandRunner;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const zip = "./ContosoSolution.zip";
  const mockHost : IHostAbstractions = {
    name: "SolutionInputFile",
    getInput: () => zip,
  }
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let deployPackageParameters: DeployPackageParameters;
  const absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    deployPackageParameters = createDeployPackageParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(deployPackageParameters: DeployPackageParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/deployPackage"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockHost, "getInput");
    stubFnc.onCall(0).returns(zip);
    await mockedActionModule.deployPackage(deployPackageParameters, runnerParameters, mockHost);
  }

  const createDeployPackageParameters = (): DeployPackageParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    packagePath: { name: "SolutionInputFile", required: true },
    logFile: { name: "LogFile", required: false },
    logConsole: { name: "LogConsole", required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(deployPackageParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", absoluteSolutionPath);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
