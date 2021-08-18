import { IHostAbstractions } from "../../../src/host/IHostAbstractions";

export class mockHost implements IHostAbstractions {
  name = 'Mock-Host';
  solutionPath = '//Test//ContosoSolution.zip';
  deploymentSettingsFile = '//Test//deploymentSettings.txt';
  maxAsyncWaitTime = '120';

  public getInput(name: string, required: boolean): string | undefined {

    if (required) {
      switch (name) {
        case 'SolutionInputFile': return this.solutionPath;
        case 'MaxAsyncWaitTime': return this.maxAsyncWaitTime;
        case 'DeploymentSettingsFile': return this.deploymentSettingsFile;
        default: return 'true';
      }
    }
  }
}
