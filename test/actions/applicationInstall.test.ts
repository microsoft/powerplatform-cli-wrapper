/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { ApplicationInstallParameters } from "src/actions/applicationInstall";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: install applications", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const environmentId = "b0a04c95-570e-4bf2-8107-02a04f79a0bf";
  const appName = "SharePointFormProcessing";
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => environmentId,
  }
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let applicationInstallParameters: ApplicationInstallParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    applicationInstallParameters = createApplicationInstallParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(applicationInstallParameters: ApplicationInstallParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/applicationInstall"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockHost, "getInput");
    stubFnc.onCall(0).returns(environmentId);
    stubFnc.onCall(1).returns(appName);
    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.instsallApplication(applicationInstallParameters, runnerParameters, mockHost);
  }

  const createApplicationInstallParameters = (): ApplicationInstallParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    environmentId: { name: 'EnvironmentId', required: true },
    applicationName: { name: 'ApplicationName', required: false },
    applicationList: { name: 'ApplicationList', required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(applicationInstallParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("application", "install", "--environment-id", environmentId, "--application-name", appName);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
