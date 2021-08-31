import { HostParameterEntry, IHostAbstractions } from "../../../src/host/IHostAbstractions";
import { platform } from "os";

export class mockHost implements IHostAbstractions {
  name = 'Mock-Host';
  relativeSolutionPath = './ContosoSolution.zip';
  absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';
  deploymentSettingsFile = '/Test/deploymentSettings.txt';
  outputdirectory = 'c:\\samplepackage';
  ruleLevelOverride = 'c:\\sameplejson';
  geoInstance = 'UnitedStates';
  maxAsyncWaitTime = '120';
  customPACheckerEndpoint = 'https://japan.api.advisor.powerapps.com/';
  fileLocation = 'sasUriFile';
  filesToAnalyze = '/Test/analyze.zip';
  filesToAnalyzeSasUri = 'c:\\filesToAnalyzeSasUri';
  filesToExclude = 'c:\\filesToExclude';
  ruleSet = '083a2ef5-7e0e-4754-9d88-9455142dc08b';
  errorLevel = 'LowIssueCount';
  errorThreshold = '0';
  artifactDestinationName = 'ArtifactLogs';

  public getInput(entry: HostParameterEntry): string | undefined {
    if (entry.required) {
      switch (entry.name) {
        case 'SolutionInputFile': return this.relativeSolutionPath;
        case 'MaxAsyncWaitTime': return this.maxAsyncWaitTime;
        case 'DeploymentSettingsFile': return this.deploymentSettingsFile;
        case 'OutputDirectory': return this.outputdirectory;
        case 'RuleLevelOverride': return this.ruleLevelOverride;
        case 'GeoInstance': return this.geoInstance;
        case 'CustomPACheckerEndpoint': return this.customPACheckerEndpoint;
        case 'FileLocation': return this.fileLocation;
        case 'FilesToAnalyze': return this.filesToAnalyze;
        case 'FilesToAnalyzeSasUri': return this.filesToAnalyzeSasUri;
        case 'FilesToExclude': return this.filesToExclude;
        case 'RuleSet': return this.ruleSet;
        case 'ErrorLevel': return this.errorLevel;
        case 'ErrorThreshold': return this.errorThreshold;
        case 'ArtifactDestinationName': return this.artifactDestinationName;

        default: return 'true';
      }
    }
  }
}
