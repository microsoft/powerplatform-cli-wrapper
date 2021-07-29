import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ExportSolutionParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mockData";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: exportSolution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let exportSolutionParameters: ExportSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    exportSolutionParameters = createMinMockExportSolutionParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(exportSolutionParameters: ExportSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/exportSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });

    await mockedActionModule.exportSolution(exportSolutionParameters, runnerParameters);
  }

  const createMinMockExportSolutionParameters = (): ExportSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    name: "Contoso",
    path: "C:\\Test\\ContosoSolution.zip",
    managed: false,
    async: false,
    maxAsyncWaitTimeInMin: 60,
    include: []
  });

  it("with minimal settings, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(exportSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", "Contoso", "--path", "C:\\Test\\ContosoSolution.zip",
      "--managed", "false", "--async", "false", "--max-async-wait-time", "60");
  });

  it("with maximal settings, calls pac runner stub with correct arguments", async () => {
    exportSolutionParameters.async = true;
    exportSolutionParameters.managed = true;
    exportSolutionParameters.maxAsyncWaitTimeInMin = 60;
    exportSolutionParameters.include = ["autonumbering", "calendar"];

    await runActionWithMocks(exportSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", "Contoso", "--path", "C:\\Test\\ContosoSolution.zip",
      "--managed", "true", "--async", "true", "--max-async-wait-time", "60", "--include", "autonumbering,calendar");
  });

  it("include parameter is already comma-delimited", async () => {
    exportSolutionParameters.include = ["autonumbering,customization", "calendar"];

    await runActionWithMocks(exportSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", "Contoso", "--path", "C:\\Test\\ContosoSolution.zip",
      "--managed", "false", "--async", "false", "--max-async-wait-time", "60", "--include", "autonumbering,customization,calendar");
  });

  it("falsey number for async wait time is also successfully passed", async () => {
    exportSolutionParameters.maxAsyncWaitTimeInMin = 0;

    await runActionWithMocks(exportSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "export", "--name", "Contoso", "--path", "C:\\Test\\ContosoSolution.zip",
      "--managed", "false", "--async", "false", "--max-async-wait-time", "0");
  });
});
