/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import * as os from 'os';
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { InstallApplicationParameters } from "src/actions/installApplication";
import Sinon = require("sinon");
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: install applications", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateAdminStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const applicationList = os.platform() === 'win32'? "D:\\Test\\mock\\applicationList.json": "/Test/mock/applicationList.json";
  const mockedHost = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let applicationInstallParameters: InstallApplicationParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    applicationInstallParameters = createApplicationInstallParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(applicationInstallParameters: InstallApplicationParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/installApplication"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockedHost, "getInput");
    stubFnc.onCall(0).returns(mockedHost.environmentUrl);
    stubFnc.onCall(1).returns(applicationList);
    authenticateAdminStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.installApplication(applicationInstallParameters, runnerParameters, mockedHost);
  }

  const createApplicationInstallParameters = (): InstallApplicationParameters => ({
    credentials: mockClientCredentials,
    environment: { name: "Environment", required: true },
    applicationListFile: { name: 'ApplicationList', required: false },
    logToConsole: false,
    verboseLogging: false
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(applicationInstallParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("application", "install", "--environment", mockedHost.environmentUrl, "--application-list", applicationList);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
