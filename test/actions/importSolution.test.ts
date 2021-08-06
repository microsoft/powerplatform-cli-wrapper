import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ImportSolutionParameters, UpdatedImportSolutionParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mockData";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: importSolution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let importSolutionParameters: ImportSolutionParameters;
  let updatedImportSolutionParameters: UpdatedImportSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    importSolutionParameters = createMinMockImportSolutionParameters();
    updatedImportSolutionParameters = createMinMockUpdatedImportSolutionParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(importSolutionParameters: ImportSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/importSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });

    await mockedActionModule.importSolution(importSolutionParameters, runnerParameters);
  }

  const createMinMockImportSolutionParameters = (): ImportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    path: "C:\\Test\\ContosoSolution.zip",
    deploymentSettingsFilePath: undefined,
    async: false,
    maxAsyncWaitTimeInMin: 60,
    importAsHolding: false,
    forceOverwrite: false,
    publishChanges: false,
    skipDependencyCheck: false,
    convertToManaged: false
  });

  const createMinMockUpdatedImportSolutionParameters = (): UpdatedImportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    path: { name: "C:\\Test\\ContosoSolution.zip", required: true },
    deploymentSettingsFilePath: undefined,
    async: false,
    maxAsyncWaitTimeInMin: 60,
    importAsHolding: false,
    forceOverwrite: false,
    publishChanges: false,
    skipDependencyCheck: false,
    convertToManaged: false
  });

  it("with minimal inputs, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", "C:\\Test\\ContosoSolution.zip",
      "--async", "false", "--import-as-holding", "false", "--force-overwrite", "false", "--publish-changes", "false",
      "--skip-dependency-check", "false", "--convert-to-managed", "false", "--max-async-wait-time", "60");
  });

  it("with all optional inputs, calls pac runner stub with correct arguments", async () => {
    importSolutionParameters.async = true;
    importSolutionParameters.maxAsyncWaitTimeInMin = 120;
    importSolutionParameters.convertToManaged = true;
    importSolutionParameters.forceOverwrite = true;
    importSolutionParameters.importAsHolding = true;
    importSolutionParameters.publishChanges = true;
    importSolutionParameters.skipDependencyCheck = true;
    importSolutionParameters.deploymentSettingsFilePath = "C:\\Test\\ContosoDeploymentSettings.zip",

      await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", "C:\\Test\\ContosoSolution.zip",
      "--async", "true", "--import-as-holding", "true", "--force-overwrite", "true", "--publish-changes", "true",
      "--skip-dependency-check", "true", "--convert-to-managed", "true", "--max-async-wait-time", "120",
      "--settings-file", "C:\\Test\\ContosoDeploymentSettings.zip");
  });
});
