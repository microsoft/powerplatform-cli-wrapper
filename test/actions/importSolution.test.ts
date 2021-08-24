import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ImportSolutionParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: importSolution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let importSolutionParameters: ImportSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    importSolutionParameters = createMinMockImportSolutionParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(importSolutionParameters: ImportSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/importSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });

    await mockedActionModule.importSolution(importSolutionParameters, runnerParameters, host);
  }

  const createMinMockImportSolutionParameters = (): ImportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    path: { name: "SolutionInputFile", required: true },
    useDeploymentSettingsFile: { name: 'UseDeploymentSettingsFile', required: false },
    async: { name: 'AsyncOperation', required: false },
    maxAsyncWaitTimeInMin: { name: 'MaxAsyncWaitTime', required: false },
    importAsHolding: { name: 'HoldingSolution', required: false },
    forceOverwrite: { name: 'OverwriteUnmanagedCustomizations', required: false },
    publishChanges: { name: 'PublishWorkflows', required: false },
    skipDependencyCheck: { name: 'SkipProductUpdateDependencies', required: false },
    convertToManaged: { name: 'ConvertToManaged', required: false },
    activatePlugins: { name: 'ActivatePlugins', required: false },
  });

  it("with minimal inputs set by host, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", host.absoluteSolutionPath,
      "--async", "false", "--import-as-holding", "false", "--force-overwrite", "false", "--publish-changes", "false",
      "--skip-dependency-check", "false", "--convert-to-managed", "false", "--max-async-wait-time", "60", "--activate-plugins", "false");
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    importSolutionParameters.useDeploymentSettingsFile = { name: 'UseDeploymentSettingsFile', required: true, defaultValue: true };
    importSolutionParameters.deploymentSettingsFile = { name: 'DeploymentSettingsFile', required: true, defaultValue: true };
    importSolutionParameters.async = { name: 'AsyncOperation', required: true, defaultValue: true };
    importSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: true, defaultValue: '180' };
    importSolutionParameters.importAsHolding = { name: 'HoldingSolution', required: true, defaultValue: true };
    importSolutionParameters.forceOverwrite = { name: 'OverwriteUnmanagedCustomizations', required: true, defaultValue: true };
    importSolutionParameters.publishChanges = { name: 'PublishWorkflows', required: true, defaultValue: true };
    importSolutionParameters.skipDependencyCheck = { name: 'SkipProductUpdateDependencies', required: true, defaultValue: true };
    importSolutionParameters.convertToManaged = { name: 'ConvertToManaged', required: true, defaultValue: true };
    importSolutionParameters.activatePlugins = { name: 'ActivatePlugins', required: true, defaultValue: true };

    await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", host.absoluteSolutionPath,
      "--async", "true", "--import-as-holding", "true", "--force-overwrite", "true", "--publish-changes", "true",
      "--skip-dependency-check", "true", "--convert-to-managed", "true", "--max-async-wait-time", host.maxAsyncWaitTime,
      "--activate-plugins", "true", "--settings-file", host.deploymentSettingsFile);
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    importSolutionParameters.useDeploymentSettingsFile = { name: 'UseDeploymentSettingsFile', required: false, defaultValue: true };
    importSolutionParameters.async = { name: 'AsyncOperation', required: false, defaultValue: true };
    importSolutionParameters.maxAsyncWaitTimeInMin = { name: 'MaxAsyncWaitTime', required: false, defaultValue: '180' };
    importSolutionParameters.importAsHolding = { name: 'HoldingSolution', required: false, defaultValue: false };
    importSolutionParameters.forceOverwrite = { name: 'OverwriteUnmanagedCustomizations', required: false, defaultValue: true };
    importSolutionParameters.publishChanges = { name: 'PublishWorkflows', required: false, defaultValue: false };
    importSolutionParameters.skipDependencyCheck = { name: 'SkipProductUpdateDependencies', required: false, defaultValue: true };
    importSolutionParameters.convertToManaged = { name: 'ConvertToManaged', required: false, defaultValue: false };
    importSolutionParameters.activatePlugins = { name: 'ActivatePlugins', required: false, defaultValue: true };

    await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", host.absoluteSolutionPath,
      "--async", "true", "--import-as-holding", "false", "--force-overwrite", "true", "--publish-changes", "false",
      "--skip-dependency-check", "true", "--convert-to-managed", "false", "--max-async-wait-time", "180", "--activate-plugins", "true");
  });
});
