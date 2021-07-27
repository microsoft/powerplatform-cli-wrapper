import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mockData";
import { DeployPackageParameters } from "src/actions/deployPackage";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: deploy package", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
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
    await mockedActionModule.deployPackage(deployPackageParameters, runnerParameters);
  }

  const createDeployPackageParameters = (): DeployPackageParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    packagePath: "c:\\samplelogpackage",
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(deployPackageParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", "c:\\samplelogpackage");
  });

  it("with minimal inputs and with all optional inputs, calls pac runner with correct args", async () => {
    deployPackageParameters.logConsole = true;
    deployPackageParameters.logFile = "c:\\samplelogdata";

    await runActionWithMocks(deployPackageParameters);

    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", "c:\\samplelogpackage", "--logConsole", "true", "--logFile", "c:\\samplelogdata");
  });
});
