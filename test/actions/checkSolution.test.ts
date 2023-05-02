/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import { CheckSolutionParameters } from "../../src/actions";
import Sinon = require("sinon");
import { platform } from "os";
import { IArtifactStore } from "src/host/IArtifactStore";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";

should();
use(sinonChai);
use(chaiAsPromised);

describe("action: check solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  let checkSolutionParameters: CheckSolutionParameters;
  const pacResults:string[] = [
    "Endpoint: https://unitedstates.api.advisor.powerapps.com/",
    "Checking these solution files:",
    "- C:\\Users\\alias\\Src\\pp-build-tools\\test\\Test-Data\\emptySolution_0_1_0_0.zip",
    "Entering InvokePowerAppsChecker - EndProcessing",
    "Executing InvokePowerAppsChecker",
    "Upload started : 1 files",
    "Uploaded finished: 1 files taking 00:00:00.5717264",
    "Calling status check API. Loop count 1",
    "Finished calling status check API. Loop count 1",
    "... Activity Waiting on results(1); Status: Analyzing; PercentComplete: 30",
    "Pausing for 15 seconds.",
    "Calling status check API. Loop count 2",
    "Finished calling status check API. Loop count 2",
    "... Activity Waiting on results(1); Status: Analyzing; PercentComplete: 100",
    "Downloading 1 files to C:\\Users\\alias\\Src\\pp-build-tools",
    "Finished downloading 1 files",
    "Exiting with Finished InvokePowerAppsChecker - EndProcessing : 00:00:17.1236412",
    "Checker results:",
    "    Files: 20220602060955_emptySolution0100.zip",
    "    Correlation Id: 4bf16222-46f7-47f0-a419-a5a1a59d96c3",
    "    Status: Finished",
    "",
    "",
    "Critical High Medium  Low Informational",
    "",
    "    0    0       0   0             0",
    "",
  ]
  const zip = "./ContosoSolution.zip";

  const spyArtifacts : IArtifactStore = {
    getTempFolder: () => '',
    upload: (artifactName, files) => {
      console.log(`name = ${artifactName}, files = ${files.join(', ')}`);
      return Promise.resolve();
    }
  }

  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => zip,
    getArtifactStore: () => spyArtifacts,
  }


  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  const absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';
  const ruleSet = "SolutionChecker";

  let customEndpoint = "";
  let samplejson = "";

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    checkSolutionParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl,
      fileLocation: { name: "FileLocation", required: true },
      solutionPath: { name: "FilesToAnalyze", required: false },
      solutionUrl: { name: "FilesToAnalyzeSasUri", required: false },
      ruleSet: { name: "RuleSet", required: false, defaultValue: ruleSet},
      ruleLevelOverride: { name: "RuleLevelOverride", required: false },
      artifactStoreName: { name: "ArtifactStoreName", required: false },
      useDefaultPAEndpoint: { name: "UseDefaultPACheckerEndpoint", required: true, defaultValue: true },
      customPAEndpoint: { name: "CustomPACheckerEndpoint", required: false, defaultValue: "" },
      errorLevel: { name: "ErrorLevel", required: false, defaultValue: "HighIssueCount" },
      errorThreshold: { name: "ErrorThreshold", required: false, defaultValue: "0" },
      failOnAnalysisError: { name: "FailOnPowerAppsCheckerAnalysisError", required: false, defaultValue: true },
      geoInstance: { name: "GeoInstance", required: false, defaultValue: "unitedstates" },
      filesExcluded: { name: "FilesToExclude", required: false, defaultValue: "" },
      saveResults: { name: "SaveResults", required: false, defaultValue: false },
    };
  });
  afterEach(() => restore());

  async function runActionWithMocks(checkSolutionParameters: CheckSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/checkSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    // const stubFnc = Sinon.stub(mockHost, "getInput").callsFake(entry => {
    Sinon.stub(mockHost, "getInput").callsFake(entry => {
      switch (entry.name) {
        case "FileLocation":
          return "localFiles";
        case "FilesToAnalyze":
          return zip;
        case "RuleSet":
          return ruleSet;
        case "RuleLevelOverride":
          return samplejson;
        case "UseDefaultPACheckerEndpoint":
          return !customEndpoint ? "true" : "false";
        case "CustomPACheckerEndpoint":
          return customEndpoint;
        default:
          return undefined;
      }
  });

    authenticateAdminStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns(pacResults);
    await mockedActionModule.checkSolution(checkSolutionParameters, runnerParameters, mockHost);
  }

  it("required, optional, and not required input types calls pac runner stub with correct arguments", async () => {
    await runActionWithMocks(checkSolutionParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("solution", "check",
    "--path", absoluteSolutionPath,
    "--ruleSet", "SolutionChecker",
    "--geo", "unitedstates",
    "--outputDirectory", "checker-output"
    );
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("verify checker with custom endpoint", async () => {
    customEndpoint = "https://msit.api.advisor.powerapps.com/";

    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check",
    "--path", absoluteSolutionPath,
    "--ruleSet", "SolutionChecker",
    "--customEndpoint", customEndpoint,
    "--outputDirectory", "checker-output"
    );
  });

  it("verify checker with no custom endpoint; fallback to environment url", async () => {
    customEndpoint = "";
    checkSolutionParameters.geoInstance =  { name: "GeoInstance", required: false, defaultValue: "" };
    checkSolutionParameters.environmentUrl = environmentUrl;

    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check",
    "--path", absoluteSolutionPath,
    "--ruleSet", "SolutionChecker",
    "--customEndpoint", environmentUrl,
    "--outputDirectory", "checker-output"
    );
  });

  it("verify checker with save results", async () => {
    customEndpoint = "";
    //checkSolutionParameters.geoInstance =  { name: "GeoInstance", required: false, defaultValue: "" };
    checkSolutionParameters.saveResults = { name: "SaveResults", required: false, defaultValue: true };

    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check",
    "--path", absoluteSolutionPath,
    "--ruleSet", "SolutionChecker",
    "--geo", "unitedstates",
    "--outputDirectory", "checker-output",
    "--saveResults", "true"
    );
  });

  it("verify checker with rule override that needs to be passed as file to pac CLI", async () => {
    customEndpoint = "";
    samplejson = '{ "rule": "sample" }';

    await runActionWithMocks(checkSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "check",
    "--path", absoluteSolutionPath,
    "--ruleSet", "SolutionChecker",
    "--ruleLevelOverride", Sinon.match(/overrideRule.json$/),
    "--geo", "unitedstates",
    "--outputDirectory", "checker-output"
    );
  });

});
