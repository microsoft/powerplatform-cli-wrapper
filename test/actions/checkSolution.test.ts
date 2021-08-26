import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { CommandRunner } from "../../src/CommandRunner";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import { CheckSolutionParameters } from "../../src/actions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: check solution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let checkSolutionParameters: CheckSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    checkSolutionParameters = createCheckSolutionParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(checkSolutionParameters: CheckSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/checkSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });
    await mockedActionModule.checkSolution(checkSolutionParameters, runnerParameters, host);
  }

  const createCheckSolutionParameters = (): CheckSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    solutionPath: { name: "SolutionInputFile", required: true },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(checkSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", host.absoluteSolutionPath);
  });

  it("with minimal inputs and with all optional inputs, calls pac runner with correct args", async () => {
    checkSolutionParameters.outputDirectory = { name: 'OutputDirectory', required: true, defaultValue: "" };
    checkSolutionParameters.geoInstance = { name: 'GeoInstance', required: true, defaultValue: "" };
    checkSolutionParameters.ruleLevelOverride = { name: 'RuleLevelOverride', required: true, defaultValue: "" };
    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", host.absoluteSolutionPath, "--outputDirectory", host.outputdirectory, 
      "--geo", host.geoInstance, "--ruleLevelOverride", host.ruleLevelOverride);
  });
});
