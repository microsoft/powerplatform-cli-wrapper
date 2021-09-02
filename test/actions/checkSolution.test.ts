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
    ruleLevelOverride: { name: "RuleLevelOverride", required: false },
    useDefaultPACheckerEndpoint: { name: "UseDefaultPACheckerEndpoint", required: false },
    fileLocation: { name: "FileLocation", required: false, defaultValue: "localFiles" },
    filesToAnalyze: { name: "FilesToAnalyze", required: false, defaultValue: "**\\*.zip" },
    filesToAnalyzeSasUri: { name: "FilesToAnalyzeSasUri", required: false },
    filesToExclude: { name: "FilesToExclude", required: false },
    ruleSet: { name: "RuleSet", required: true },
    errorThreshold: { name: "ErrorThreshold", required: false, defaultValue: "0" },
    failOnPowerAppsCheckerAnalysisError: { name: "FailOnPowerAppsCheckerAnalysisError", required: false },
    errorLevel: { name: "ErrorLevel", required: false, defaultValue: "HighIssueCount" },
    artifactDestinationName: { name: "ArtifactDestinationName", required: false, defaultValue: "CodeAnalysisLogs" },
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(checkSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", host.absoluteSolutionPath, "--ruleSet", host.ruleSet,
    "--errorThreshold", host.errorThreshold, "--failOnPowerAppsCheckerAnalysisError", "false", "--filesToAnalyze", "**\\*.zip", 
    "--errorLevel", "HighIssueCount", "--artifactDestinationName", "CodeAnalysisLogs");
  });

  it("with minimal inputs and with all optional inputs, calls pac runner stub with correct args", async () => {
    checkSolutionParameters.outputDirectory = { name: 'OutputDirectory', required: true };
    checkSolutionParameters.geoInstance = { name: 'GeoInstance', required: true };
    checkSolutionParameters.ruleLevelOverride = { name: 'RuleLevelOverride', required: true };
    checkSolutionParameters.useDefaultPACheckerEndpoint = { name: "UseDefaultPACheckerEndpoint", required: true, defaultValue: false };
    checkSolutionParameters.customPACheckerEndpoint = { name: "CustomPACheckerEndpoint", required: true, defaultValue: "" };
    checkSolutionParameters.fileLocation = { name: "FileLocation", required: true, defaultValue: "localFiles" };
    checkSolutionParameters.filesToAnalyzeSasUri = { name: "FilesToAnalyzeSasUri", required: true };
    checkSolutionParameters.filesToExclude = { name: "FilesToExclude", required: true };
    checkSolutionParameters.ruleSet = { name: "RuleSet", required: true };
    checkSolutionParameters.errorLevel = { name: "ErrorLevel", required: true, defaultValue: "HighIssueCount" };
    checkSolutionParameters.errorThreshold = { name: "ErrorThreshold", required: true, defaultValue: "0" };
    checkSolutionParameters.failOnPowerAppsCheckerAnalysisError = { name: "FailOnPowerAppsCheckerAnalysisError", required: true, defaultValue: true };
    checkSolutionParameters.artifactDestinationName = { name: "ArtifactDestinationName", required: true, defaultValue: "CodeAnalysisLogs" };
    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", host.absoluteSolutionPath, "--ruleSet", host.ruleSet, 
    "--errorThreshold", host.errorThreshold, "--failOnPowerAppsCheckerAnalysisError", "true", "--outputDirectory", host.outputdirectory, 
    "--geo", host.geoInstance, "--ruleLevelOverride", host.ruleLevelOverride, "--customPACheckerEndpoint", host.customPACheckerEndpoint, 
    "--filesToAnalyzeSasUri", host.filesToAnalyzeSasUri, "--filesToExclude", host.filesToExclude, "--errorLevel", host.errorLevel, 
    "--artifactDestinationName", host.artifactDestinationName);
  });
});
