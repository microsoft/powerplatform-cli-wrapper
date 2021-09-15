import { HostParameterEntry, IHostAbstractions } from "../../../src/host/IHostAbstractions";
import { platform } from "os";

export class mockHost implements IHostAbstractions {
  name = 'Mock-Host';
  solutionName = 'Mock-Solution';
  relativeSolutionPath = './ContosoSolution.zip';
  absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';
  deploymentSettingsFile = '/Test/deploymentSettings.txt';
  logDataFile = 'c:\\samplelogdata'
  maxAsyncWaitTime = '120';
  targetVersion = '0.0.0';
  backupLabel = 'Mock-Label';
  environmentName = 'Mock-Environment';
  environmentType = 'Sandbox';
  currency = 'USD';
  language = 'English';
  region = 'United States';
  domainName = 'Contoso';
  templates = 'Customer Service, Sample App';

  public getInput(entry: HostParameterEntry): string | undefined {
    if (entry.required) {
      switch (entry.name) {
        case 'SolutionInputFile': return this.relativeSolutionPath;
        case 'SolutionOutputFile': return this.relativeSolutionPath;
        case 'SolutionName': return this.solutionName;
        case 'MaxAsyncWaitTime': return this.maxAsyncWaitTime;
        case 'DeploymentSettingsFile': return this.deploymentSettingsFile;
        case 'TargetVersion': return this.targetVersion;
        case 'BackupLabel': return this.backupLabel;
        case 'LogDataFile': return this.logDataFile;
        case 'DisplayName': return this.environmentName;
        case 'EnvironmentSku': return this.environmentType;
        case 'CurrencyName': return this.currency;
        case 'DomainName': return this.domainName;
        case 'LanguageName': return this.language;
        case 'LocationName': return this.region;
        case 'AppsTemplate': return this.templates;
        default: return 'true';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getInputValue(entry: HostParameterEntry, isRequired: boolean): string | undefined {
    return;
  }
}
