/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { stub } from "sinon";
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
  const pacStub: CommandRunner = stub();
  const authenticateEnvironmentStub: Sinon.SinonStub<any[], any> = stub();
  const clearAuthenticationStub: Sinon.SinonStub<any[], any> = stub();
  const zip = "./ContosoSolution.zip";
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => zip,
  }
  const samplejson = "samplejson";
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  const absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';

  async function runActionWithMocks(checkSolutionParameters: CheckSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/checkSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockHost, "getInput");
    stubFnc.onCall(0).returns(zip);
    stubFnc.onCall(1).returns(samplejson);
    await mockedActionModule.checkSolution(checkSolutionParameters, runnerParameters, mockHost);
  }

  const createCheckSolutionParameters = (): CheckSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    solutionPath: { name: "SolutionInputFile", required: true },
    ruleLevelOverride: { name: "RuleLevelOverride", required: false },
    geoInstance: undefined,
    outputDirectory: { name: "OutputDirectory", required: false },
  });

  it("required, optional, and not required input types calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(createCheckSolutionParameters());
    
    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", absoluteSolutionPath,
    "--ruleLevelOverride", samplejson);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
