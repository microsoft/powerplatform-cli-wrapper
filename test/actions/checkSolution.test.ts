import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { CommandRunner } from "../../src/CommandRunner";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import { CheckSolutionParameters } from "../../src/actions";
import Sinon = require("sinon");
import { platform } from "os";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: check solution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const mockHost : IHostAbstractions = {
    name: "SolutionInputFile",
    getInput: () => { throw new Error() },
    getInputValue: () => "./ContosoSolution.zip",
  }
  const samplejson = "samplejson";
  const stubFnc = Sinon.stub(mockHost, "getInputValue");
  stubFnc.onCall(0).returns("./ContosoSolution.zip");
  stubFnc.onCall(1).returns("samplejson");
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let checkSolutionParameters: CheckSolutionParameters;
  const absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';

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
    await mockedActionModule.checkSolution(checkSolutionParameters, runnerParameters, mockHost);
  }

  const createCheckSolutionParameters = (): CheckSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    solutionPath: { name: "SolutionInputFile", required: true },
    ruleLevelOverride: { name: "RuleLevelOverride", required: false },
    geoInstance: undefined,
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(checkSolutionParameters);
    
    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", absoluteSolutionPath,
    "--ruleLevelOverride", samplejson);
  });
});
