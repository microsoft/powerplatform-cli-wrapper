/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { stub } from "sinon";
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
  const pacStub: Sinon.SinonStub<any[],any> = stub();
  const authenticateEnvironmentStub: Sinon.SinonStub<any[], any> = stub();
  const clearAuthenticationStub: Sinon.SinonStub<any[], any> = stub();
  const pacResults:string[] = [
    "Entering InvokePowerAppsChecker - EndProcessing",
    "Executing InvokePowerAppsChecker",
    "",
    "Upload started : 1 files",
    "",
    "Uploaded finished: 1 files taking 00:00:00.2915742",
    "",
    "Calling status check API. Loop count 1",
    "",
    "Finished calling status check API. Loop count 1",
    "",
    "... Activity Waiting on results(1); Status: Analyzing; PercentComplete: 30",
    "Pausing for 15 seconds.",
    "",
    "Calling status check API. Loop count 2",
    "",
    "Finished calling status check API. Loop count 2",
    "... Activity Waiting on results(1); Status: Analyzing; PercentComplete: 100",
    "",
    "Downloading 1 files to C:\\Users\\penguy\\src\\GithubActions",
    "",
    "Finished downloading 1 files",
    "",
    "Exiting with Finished InvokePowerAppsChecker - EndProcessing : 00:00:16.0008479",
    "",
    " Critical High Medium  Low Informational ",
    "",
    "        0    0       2   1             0",
    "",
    "",
  ]
  const zip = "./ContosoSolution.zip";
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => zip,
  }
  const samplejson = "samplejson";
  const customEndpoint = "www.contoso.com";
  const fileLocation = "localFiles";
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
    stubFnc.onCall(0).returns(undefined);
    stubFnc.onCall(1).returns(undefined);
    stubFnc.onCall(2).returns(fileLocation);
    stubFnc.onCall(3).returns(zip);
    stubFnc.onCall(4).returns(samplejson);
    stubFnc.onCall(5).returns(undefined);
    stubFnc.onCall(6).returns(undefined);
    stubFnc.onCall(7).returns(customEndpoint);

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns(pacResults);
    await mockedActionModule.checkSolution(checkSolutionParameters, runnerParameters, mockHost);
  }

  const createCheckSolutionParametersForTask = (): CheckSolutionParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    fileLocation: { name: "FileLocation", required: false, defaultValue: "localFiles" },
    solutionPath: { name: "FilesToAnalyze", required: false },
    solutionUrl: { name: "FilesToAnalyzeSasUri", required: false },
    ruleLevelOverride: { name: "RuleLevelOverride", required: false },
    outputDirectory: { name: "OutputDirectory", required: false },
    useDefaultPAEndpoint: { name: "UseDefaultPACheckerEndpoint", required: false, defaultValue: true },
    customPAEndpoint: { name: "CustomPACheckerEndpoint", required: false, defaultValue: "" },
    errorLevel: { name: "ErrorLevel", required: false, defaultValue: "HighIssueCount" },
    errorThreshold: { name: "ErrorThreshold", required: false, defaultValue: "0" },
    failOnAnalysisError: { name: "FailOnPowerAppsCheckerAnalysisError", required: false, defaultValue: true },
  });

  it("required, optional, and not required input types calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(createCheckSolutionParametersForTask());
    
    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", absoluteSolutionPath,
    "--ruleLevelOverride", samplejson, "--customEndpoint", customEndpoint);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
