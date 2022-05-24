/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ExportSolutionParameters } from "../../src/actions";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
import { IHostAbstractions } from "src/host/IHostAbstractions";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: exportSolution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let exportSolutionParameters: ExportSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    exportSolutionParameters = createMinMockExportSolutionParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(exportSolutionParameters: ExportSolutionParameters, host: IHostAbstractions): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/exportSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.exportSolution(exportSolutionParameters, runnerParameters, host);
  }

  const createMinMockExportSolutionParameters = (): ExportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    name: { name: "SolutionName", required: true },
    path: { name: "SolutionOutputFile", required: true },
    managed: { name: 'Managed', required: false },
    async: { name: 'AsyncOperation', required: false },
    maxAsyncWaitTimeInMin: { name: 'MaxAsyncWaitTime', required: false },
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

  it("with minimal inputs set by host, calls pac runner stub with correct arguments", async () => {
    const host = new mockHost();
    await runActionWithMocks(exportSolutionParameters, host);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", host.solutionName, "--path", host.absoluteSolutionPath);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    const host = new mockHost((entry) => {
      switch (entry.name) {
        case "Managed":
        case "AsyncOperation":
        case "ExportAutoNumberingSettings":
        case "ExportCalendarSettings":
        case "ExportCustomizationSettings":
        case "ExportEmailTrackingSettings":
        case "ExportExternalApplicationSettings":
        case "ExportGeneralSettings":
        case "ExportIsvConfig":
        case "ExportMarketingSettings":
        case "ExportOutlookSynchronizationSettings":
        case "ExportRelationshipRoles":
        case "ExportSales":
          return "true";
        case "MaxAsyncWaitTime":
          return "120"
        default: return undefined;
      }
    });
    await runActionWithMocks(exportSolutionParameters, host);

    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", host.solutionName, "--path", host.absoluteSolutionPath,
      "--managed", "true", "--async", "true", "--max-async-wait-time", "120", "--include",
      "autonumbering,calendar,customization,emailtracking,externalapplications,general,isvconfig,marketing,outlooksynchronization,relationshiproles,sales");
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    const host = new mockHost((entry) => {
      switch (entry.name) {
        case "Managed":
        case "AsyncOperation":
        case "ExportAutoNumberingSettings":
        case "ExportCalendarSettings":
        case "ExportEmailTrackingSettings":
        case "ExportExternalApplicationSettings":
        case "ExportMarketingSettings":
        case "ExportRelationshipRoles":
          return "true";
        case "ExportCustomizationSettings":
        case "ExportGeneralSettings":
        case "ExportIsvConfig":
        case "ExportOutlookSynchronizationSettings":
        case "ExportSales":
          return "false";
        case "MaxAsyncWaitTime":
          return "120"
        default: return undefined;
      }
    });
    await runActionWithMocks(exportSolutionParameters, host);

    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", host.solutionName, "--path", host.absoluteSolutionPath,
      "--managed", "true", "--async", "true", "--max-async-wait-time", "120", "--include",
      "autonumbering,calendar,emailtracking,externalapplications,marketing,relationshiproles");
  });
});
