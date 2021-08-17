import { HostParameterEntry, IHostAbstractions, WorkingDirectoryParameters } from "../../../src/host/IHostAbstractions";
import { deploymentSettingsFile, maxAsyncWaitTime, solutionPath, workingDirectory } from "./mockData";

export class mockHost implements IHostAbstractions {

  name = "Mock-Host";

  public getValidInput(name: string, required: boolean): string | undefined {
    if (required) {
      switch (name) {
        case 'SolutionInputFile': return solutionPath;
        case 'MaxAsyncWaitTime': return maxAsyncWaitTime;
        case 'DeploymentSettingsFile': return deploymentSettingsFile;
        default: return 'true';
      }
    }
  }

  public getWorkingDirectory(params: HostParameterEntry): string | WorkingDirectoryParameters {
    const workingDir = workingDirectory;
    const textValue = this.getValidInput(params.name, params.required);
    return (!textValue) ? (typeof params.defaultValue === 'string' ? params.defaultValue : workingDir) : { workingDir: workingDir, path: textValue };
  }
}
