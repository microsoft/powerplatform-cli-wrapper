import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ImportSolutionParameters } from "../../src/actions";
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

    await mockedActionModule.importSolution(importSolutionParameters, runnerParameters);
  }

  const createMinMockImportSolutionParameters = (): ImportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    path: "C:\\Test\\ContosoSolution.zip"
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", "C:\\Test\\ContosoSolution.zip");
  });

  it("with optional inputs, calls pac runner with correct arguments", async () => {
    importSolutionParameters.activatePlugins = true;
    importSolutionParameters.async = undefined;
    importSolutionParameters.convertToManaged = true;
    importSolutionParameters.forceOverwrite = undefined;
    importSolutionParameters.importAsHolding = false;
    importSolutionParameters.maxAsyncWaitTimeInMin = 60;
    importSolutionParameters.publishChanges = true;
    importSolutionParameters.skipDependencyCheck = false;

    await runActionWithMocks(importSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "import", "--path", "C:\\Test\\ContosoSolution.zip",
      "--activate-plugins", "--publish-changes", "--convert-to-managed", "--max-async-wait-time", "60");
  });
});
