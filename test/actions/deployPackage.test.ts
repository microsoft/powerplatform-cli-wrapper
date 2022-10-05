/* eslint-disable @typescript-eslint/no-explicit-any */
import Sinon = require("sinon");
import os = require('os');
import path = require('path');
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { DeployPackageParameters } from "src/actions/deployPackage";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";

should();
use(sinonChai);
use(chaiAsPromised);

describe("action: deploy package", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;

  const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
  const testPackagePath = path.join(runnerParameters.workingDir, 'ConstosoPackage.dll');
  const mockedHost = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let deployPackageParameters: DeployPackageParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    deployPackageParameters = createDeployPackageParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(deployPackageParameters: DeployPackageParameters) {
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/deployPackage"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockedHost, "getInput");
    stubFnc.onCall(0).returns(testPackagePath);

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.deployPackage(deployPackageParameters, runnerParameters, mockedHost);
  }

  const createDeployPackageParameters = (): DeployPackageParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    packagePath: { name: "SolutionInputFile", required: true },
    settings: { name: "Settings", required: false },
    logConsole: { name: "LogConsole", required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    if (os.platform() !== 'win32') {
      console.log(">> Skipping deploy-package test, only supported on Windows");
      return;
    }
    await runActionWithMocks(deployPackageParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("package", "deploy", "--package", testPackagePath);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
