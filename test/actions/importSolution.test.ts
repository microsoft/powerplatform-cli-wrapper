/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ImportSolutionParameters } from "../../src/actions";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
import { IHostAbstractions } from "src/host/IHostAbstractions";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: importSolution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let importSolutionParameters: ImportSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    importSolutionParameters = createMinMockImportSolutionParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(importSolutionParameters: ImportSolutionParameters, host: IHostAbstractions): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/importSolution"),
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
    await mockedActionModule.importSolution(importSolutionParameters, runnerParameters, host);
  }

  const createMinMockImportSolutionParameters = (): ImportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    path: { name: "SolutionInputFile", required: true },
    useDeploymentSettingsFile: { name: 'UseDeploymentSettingsFile', required: false },
    deploymentSettingsFile: { name: 'DeploymentSettingsFile', required: false },
    async: { name: 'AsyncOperation', required: false },
    maxAsyncWaitTimeInMin: { name: 'MaxAsyncWaitTime', required: false },
    importAsHolding: { name: 'HoldingSolution', required: false },
    forceOverwrite: { name: 'OverwriteUnmanagedCustomizations', required: false },
    publishChanges: { name: 'PublishWorkflows', required: false },
    skipDependencyCheck: { name: 'SkipProductUpdateDependencies', required: false },
    convertToManaged: { name: 'ConvertToManaged', required: false },
    activatePlugins: { name: 'ActivatePlugins', required: false },
    skipLowerVersion: { name: 'SkipLowerVersion', required: false },
    logToConsole: false
  });

  it("with minimal inputs set by host, calls pac runner stub with correct arguments", async () => {
    const host = new mockHost();
    await runActionWithMocks(importSolutionParameters, host);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", host.absoluteSolutionPath);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with minimal inputs and logging to console, calls pac runner stub with correct arguments", async () => {
    const host = new mockHost();
    importSolutionParameters.logToConsole = true;
    await runActionWithMocks(importSolutionParameters, host);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWithExactly("solution", "import", "--path", host.absoluteSolutionPath, "--log-to-console");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    // importSolutionParameters.useDeploymentSettingsFile = { name: 'UseDeploymentSettingsFile', required: true, defaultValue: true };
    // importSolutionParameters.deploymentSettingsFile = { name: 'DeploymentSettingsFile', required: true, defaultValue: true };
    // importSolutionParameters.async = { name: 'AsyncOperation', required: true, defaultValue: true };
    // importSolutionParameters.importAsHolding = { name: 'HoldingSolution', required: true, defaultValue: true };
    // importSolutionParameters.forceOverwrite = { name: 'OverwriteUnmanagedCustomizations', required: true, defaultValue: true };
    // importSolutionParameters.publishChanges = { name: 'PublishWorkflows', required: true, defaultValue: true };
    // importSolutionParameters.skipDependencyCheck = { name: 'SkipProductUpdateDependencies', required: true, defaultValue: true };
    // importSolutionParameters.convertToManaged = { name: 'ConvertToManaged', required: true, defaultValue: true };
    // importSolutionParameters.activatePlugins = { name: 'ActivatePlugins', required: true, defaultValue: true };

    const host = new mockHost((entry) => {
      switch (entry.name) {
        case "AsyncOperation":
        case "UseDeploymentSettingsFile":
        case "HoldingSolution":
        case "OverwriteUnmanagedCustomizations":
        case "PublishWorkflows":
        case "SkipProductUpdateDependencies":
        case "ConvertToManaged":
        case "ActivatePlugins":
            return 'true';
        case "SkipLowerVersion":
            return 'false';
        case "DeploymentSettingsFile":
          return '/Test/deploymentSettings.txt';
        case "MaxAsyncWaitTime":
          return '120'
        default: return undefined;
      }
    });
    await runActionWithMocks(importSolutionParameters, host);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", host.absoluteSolutionPath,
      "--async", "true", "--import-as-holding", "true", "--force-overwrite", "true", "--publish-changes", "true",
      "--skip-dependency-check", "true", "--convert-to-managed", "true", "--max-async-wait-time", host.maxAsyncWaitTime,
      "--activate-plugins", "true", "--skip-lower-version", "false", "--settings-file", host.deploymentSettingsFile);
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    // importSolutionParameters.useDeploymentSettingsFile = { name: 'UseDeploymentSettingsFile', required: false, defaultValue: true };
    importSolutionParameters.async = { name: 'AsyncOperation', required: false, defaultValue: true };
    importSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: false, defaultValue: '180' };
    importSolutionParameters.importAsHolding = { name: 'HoldingSolution', required: false, defaultValue: false };
    importSolutionParameters.forceOverwrite = { name: 'OverwriteUnmanagedCustomizations', required: false, defaultValue: true };
    importSolutionParameters.publishChanges = { name: 'PublishWorkflows', required: false, defaultValue: false };
    importSolutionParameters.skipDependencyCheck = { name: 'SkipProductUpdateDependencies', required: false, defaultValue: true };
    importSolutionParameters.convertToManaged = { name: 'ConvertToManaged', required: false, defaultValue: false };
    importSolutionParameters.activatePlugins = { name: 'ActivatePlugins', required: false, defaultValue: true };
    importSolutionParameters.skipLowerVersion = { name: 'SkipLowerVersion', required: false, defaultValue: false };

    const host = new mockHost((entry) =>
    !entry.required ?
      entry.defaultValue?.toString() : undefined);
    await runActionWithMocks(importSolutionParameters, host);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", host.absoluteSolutionPath,
      "--async", "true", "--import-as-holding", "false", "--force-overwrite", "true", "--publish-changes", "false",
      "--skip-dependency-check", "true", "--convert-to-managed", "false", "--max-async-wait-time", "180", "--activate-plugins", "true", "--skip-lower-version", "false");
  });
});
