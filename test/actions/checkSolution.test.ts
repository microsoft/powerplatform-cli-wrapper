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
    outputDirectory: { name: "OutputDirectory", required: false },
    geoInstance: { name: "GeoInstance", required: false },
    ruleLevelOverride: { name: "RuleLevelOverride", required: false },
    useDefaultPACheckerEndpoint: { name: "UseDefaultPACheckerEndpoint", required: false },
    fileLocation: { name: "FileLocation", required: false },
    filesToAnalyze: { name: "FilesToAnalyze", required: false },
    filesToAnalyzeSasUri: { name: "FilesToAnalyzeSasUri", required: false },
    filesToExclude: { name: "FilesToExclude", required: false },
    ruleSet: { name: "RuleSet", required: false },
    errorLevel: { name: "ErrorLevel", required: false },
    errorThreshold: { name: "ErrorThreshold", required: false },
    failOnPowerAppsCheckerAnalysisError: { name: "FailOnPowerAppsCheckerAnalysisError", required: false },
    artifactDestinationName: { name: "ArtifactDestinationName", required: false },
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
    checkSolutionParameters.useDefaultPACheckerEndpoint = { name: "UseDefaultPACheckerEndpoint", required: true, defaultValue: true };
    checkSolutionParameters.customPACheckerEndpoint = { name: "CustomPACheckerEndpoint", required: true, defaultValue: "" };
    checkSolutionParameters.fileLocation = { name: "FileLocation", required: true, defaultValue: "" };
    checkSolutionParameters.filesToAnalyze = { name: "FilesToAnalyze", required: true, defaultValue: "" };
    checkSolutionParameters.filesToAnalyzeSasUri = { name: "FilesToAnalyzeSasUri", required: true, defaultValue: "" };
    checkSolutionParameters.filesToExclude = { name: "FilesToExclude", required: true, defaultValue: "" };
    checkSolutionParameters.ruleSet = { name: "RuleSet", required: true, defaultValue: "" };
    checkSolutionParameters.errorLevel = { name: "ErrorLevel", required: true, defaultValue: "" };
    checkSolutionParameters.errorThreshold = { name: "ErrorThreshold", required: true, defaultValue: "0" };
    checkSolutionParameters.failOnPowerAppsCheckerAnalysisError = { name: "FailOnPowerAppsCheckerAnalysisError", required: true, defaultValue: true };
    checkSolutionParameters.artifactDestinationName = { name: "ArtifactDestinationName", required: true, defaultValue: "" };
    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", host.absoluteSolutionPath, "--errorThreshold", host.errorThreshold, "--failOnPowerAppsCheckerAnalysisError", "true", 
    "--outputDirectory", host.outputdirectory, "--geo", host.geoInstance, "--ruleLevelOverride", host.ruleLevelOverride, "--customPACheckerEndpoint", "https://japan.api.advisor.powerapps.com/", 
    "--fileLocation", host.fileLocation, "--filesToAnalyze", host.filesToAnalyze, "--filesToAnalyzeSasUri", host.filesToAnalyzeSasUri, "--filesToExclude", host.filesToExclude,
    "--ruleSet", host.ruleSet, "--errorLevel", host.errorLevel, "--artifactDestinationName", host.artifactDestinationName);
  });

  it("with optional inputs set to default values, calls pac runner stub with correct arguments", async () => {
    checkSolutionParameters.useDefaultPACheckerEndpoint = { name: "UseDefaultPACheckerEndpoint", required: true, defaultValue: false };
    checkSolutionParameters.errorThreshold = { name: "ErrorThreshold", required: true, defaultValue: "0" };
    checkSolutionParameters.failOnPowerAppsCheckerAnalysisError = { name: "FailOnPowerAppsCheckerAnalysisError", required: false, defaultValue: true };
    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check", "--path", host.absoluteSolutionPath, "--errorThreshold", host.errorThreshold, 
    "--failOnPowerAppsCheckerAnalysisError", "true");
  });
});
