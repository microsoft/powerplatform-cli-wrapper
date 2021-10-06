/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ExportSolutionParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: exportSolution", () => {
  let pacStub: CommandRunner;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
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

  async function runActionWithMocks(exportSolutionParameters: ExportSolutionParameters): Promise<void> {
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

    await mockedActionModule.exportSolution(exportSolutionParameters, runnerParameters, host);
  }

  const createMinMockExportSolutionParameters = (): ExportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    name: { name: "SolutionName", required: true },
    path: { name: "SolutionOutputFile", required: true },
    managed: { name: 'Managed', required: false },
    targetVersion: { name: 'TargetVersion', required: false },
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
    await runActionWithMocks(exportSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
      pacStub.should.have.been.calledOnceWith("solution", "export", "--name", host.solutionName, "--path", host.absoluteSolutionPath);
      clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    exportSolutionParameters.managed = { name: 'Managed', required: true },
    exportSolutionParameters.async = { name: 'AsyncOperation', required: true },
    exportSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: true },
    exportSolutionParameters.targetVersion = { name: 'TargetVersion', required: true },
    exportSolutionParameters.autoNumberSettings = { name: 'ExportAutoNumberingSettings', required: true },
    exportSolutionParameters.calenderSettings = { name: 'ExportCalendarSettings', required: true },
    exportSolutionParameters.customizationSettings = { name: 'ExportCustomizationSettings', required: true },
    exportSolutionParameters.emailTrackingSettings = { name: 'ExportEmailTrackingSettings', required: true },
    exportSolutionParameters.externalApplicationSettings = { name: 'ExportExternalApplicationSettings', required: true },
    exportSolutionParameters.generalSettings = { name: 'ExportGeneralSettings', required: true },
    exportSolutionParameters.isvConfig = { name: 'ExportIsvConfig', required: true },
    exportSolutionParameters.marketingSettings = { name: 'ExportMarketingSettings', required: true },
    exportSolutionParameters.outlookSynchronizationSettings = { name: 'ExportOutlookSynchronizationSettings', required: true },
    exportSolutionParameters.relationshipRoles = { name: 'ExportRelationshipRoles', required: true },
    exportSolutionParameters.sales = { name: 'ExportSales', required: true }

    await runActionWithMocks(exportSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", host.solutionName, "--path", host.absoluteSolutionPath,
      "--managed", "true", "--async", "true", "--max-async-wait-time", "120", "--targetversion", host.targetVersion, "--include",
      "autonumbering,calendar,customization,emailtracking,externalapplications,general,isvconfig,marketing,outlooksynchronization,relationshiproles,sales");
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    exportSolutionParameters.managed = { name: 'Managed', required: true, defaultValue: true },
    exportSolutionParameters.async = { name: 'AsyncOperation', required: true },
    exportSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: true },
    exportSolutionParameters.targetVersion = { name: 'TargetVersion', required: true },
    exportSolutionParameters.autoNumberSettings = { name: 'ExportAutoNumberingSettings', required: false, defaultValue: true },
    exportSolutionParameters.calenderSettings = { name: 'ExportCalendarSettings', required: false, defaultValue: true },
    exportSolutionParameters.customizationSettings = { name: 'ExportCustomizationSettings', required: false, defaultValue: false },
    exportSolutionParameters.emailTrackingSettings = { name: 'ExportEmailTrackingSettings', required: false, defaultValue: true  },
    exportSolutionParameters.externalApplicationSettings = { name: 'ExportExternalApplicationSettings', required: false, defaultValue: true  },
    exportSolutionParameters.generalSettings = { name: 'ExportGeneralSettings', required: false, defaultValue: false },
    exportSolutionParameters.isvConfig = { name: 'ExportIsvConfig', required: false, defaultValue: false },
    exportSolutionParameters.marketingSettings = { name: 'ExportMarketingSettings', required: false, defaultValue: true },
    exportSolutionParameters.outlookSynchronizationSettings = { name: 'ExportOutlookSynchronizationSettings', required: false, defaultValue: false },
    exportSolutionParameters.relationshipRoles = { name: 'ExportRelationshipRoles', required: false, defaultValue: true },
    exportSolutionParameters.sales = { name: 'ExportSales', required: false, defaultValue: false }

    await runActionWithMocks(exportSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", host.solutionName, "--path", host.absoluteSolutionPath,
      "--managed", "true", "--async", "true", "--max-async-wait-time", "120", "--targetversion", host.targetVersion, "--include",
      "autonumbering,calendar,emailtracking,externalapplications,marketing,relationshiproles");
  });
});
