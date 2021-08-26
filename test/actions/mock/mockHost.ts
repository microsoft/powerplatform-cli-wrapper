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

  public getInput(entry: HostParameterEntry): string | undefined {
    if (entry.required) {
      switch (entry.name) {
        case 'SolutionInputFile': return this.relativeSolutionPath;
        case 'MaxAsyncWaitTime': return this.maxAsyncWaitTime;
        case 'DeploymentSettingsFile': return this.deploymentSettingsFile;
        case 'OutputDirectory': return this.outputdirectory;
        case 'RuleLevelOverride': return this.ruleLevelOverride;
        case 'GeoInstance': return this.geoInstance;
        default: return 'true';
      }
    }
  }
}
