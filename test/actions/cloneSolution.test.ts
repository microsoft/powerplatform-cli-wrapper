/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { CloneSolutionParameters } from "src/actions/cloneSolution";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: clone solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => "test",
  }
  const name = "sampleSolution";
  const version = "1.0.0.2";
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let cloneSolutionParameters: CloneSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    cloneSolutionParameters = createCloneSolutionParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(cloneSolutionParameters: CloneSolutionParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/cloneSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockHost, "getInput");
    stubFnc.onCall(0).returns(name);
    stubFnc.onCall(1).returns(version);

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.cloneSolution(cloneSolutionParameters, runnerParameters, mockHost);
  }

  const createCloneSolutionParameters = (): CloneSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    name: { name: 'SolutionName', required: true },
    targetVersion: { name: 'TargetVersion', required: false },
    outputDirectory: { name: 'OutputDirectory', required: false },
    autoNumberSettings: { name: 'ExportAutoNumberingSettings', required: false },
    calenderSettings: { name: 'ExportCalendarSettings', required: false },
    customizationSettings: { name: 'ExportCustomizationSettings', required: false },
    emailTrackingSettings: { name: 'ExportEmailTrackingSettings', required: false },
    externalApplicationSettings: { name: 'ExportExternalApplicationSettings', required: false },
    generalSettings: { name: 'ExportGeneralSettings', required: false },
    isvConfig: { name: 'ExportIsvConfig', required: false },
    marketingSettings: { name: 'ExportMarketingSettings', required: false },
    outlookSynchronizationSettings: { name: 'ExportOutlookSynchronizationSettings', required: false },
    relationshipRoles: { name: 'ExportRelationshipRoles', required: false },
    sales: { name: 'ExportSales', required: false }
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(cloneSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("solution", "clone", "--name", name, "--targetversion", version);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
