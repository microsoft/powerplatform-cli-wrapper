import path = require("path");
import os = require("os");
import { IArtifactStore } from "src/host/IArtifactStore";
import { GetInputSignature, HostParameterEntry, IHostAbstractions } from "../../../src/host/IHostAbstractions";

export class mockHost implements IHostAbstractions {
  private readonly _spy: GetInputSignature | undefined;

  // public constructor(customEntry?: HostParameterEntry, customValue?: string) {
  public constructor(spy?: GetInputSignature) {
    this._spy = spy;
  }

  name = 'Mock-Host';
  solutionName = 'Mock-Solution';
  relativeSolutionPath = './ContosoSolution.zip';
  absoluteSolutionPath = (os.platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';
  deploymentSettingsFile = '/Test/deploymentSettings.txt';
  logDataFile = 'c:\\samplelogdata'
  maxAsyncWaitTime = '120';
  backupLabel = 'Mock-Label';
  environment = 'https://contoso3.crm.dynamics.com/';
  environmentName = 'Mock-Environment';
  environmentType = 'Sandbox';
  currency = 'USD';
  language = '1033';
  region = 'United States';
  domainName = 'Contoso';
  templates = 'Customer Service, Sample App';
  environmentUrl = 'https://contoso.crm.dynamics.com/';
  targetEnvironment = 'https://contoso4.crm.dynamics.com/';
  targetEnvironmentUrl = 'https://contoso2.crm.dynamics.com/';
  environmentId = '0000000000';
  targetEnvironmentId = '0000000001';
  restoreTimeStamp = '01/01/2001 00:00';
  friendlyName = 'Mock-Friendly-Name';
  copyType = 'Minimal Copy';
  notes = 'Sample Notes';
  purpose = 'Purpose';
  buildVersion = '1';
  teamId = '00000000-0000-0000-0000-000000000001';
  user = 'test@contoso.onmicrosoft.com';
  role = 'Bot Author';
  schemaFile = './ContosoSchema.xml';
  dataFile = './ContosoData.zip';
  dataDirectory = './ContosoData';
  incidentTableName = 'incident';
  tableComponentType = 1;
  applicationUser = 'true';
  businessUnit = 'BUS00000-0000-0000-0000-000000000003';
  teamType = "1";
  membershipType = "2";
  azureAadGroup = 'AZUREGROU-P000-0000-0000-000000000002';
  botId = '00000000-0000-0000-0000-000000000003';
  catalogItemId = '00000000-0000-0000-0000-000000000004';

  public getInput(entry: HostParameterEntry): string | undefined {
    const candidateValue = this._spy ? this._spy(entry) : undefined;
    if (candidateValue) return candidateValue;

    if (entry.required) {
      switch (entry.name) {
        case 'SolutionInputFile':
        case 'SolutionOutputFile': return this.relativeSolutionPath;
        case 'SolutionName': return this.solutionName;
        case 'MaxAsyncWaitTime': return this.maxAsyncWaitTime;
        case 'DeploymentSettingsFile': return this.deploymentSettingsFile;
        case 'BackupLabel': return this.backupLabel;
        case 'LogDataFile': return this.logDataFile;
        case 'DisplayName': return this.environmentName;
        case 'EnvironmentSku': return this.environmentType;
        case 'CurrencyName': return this.currency;
        case 'DomainName': return this.domainName;
        case 'Language':
        case 'LanguageName': return this.language;
        case 'LocationName': return this.region;
        case 'AppsTemplate': return this.templates;
        case 'Environment': return this.environment;
        case 'EnvironmentUrl': return this.environmentUrl;
        case 'TargetEnvironmentUrl': return this.targetEnvironmentUrl;
        case 'EnvironmentId': return this.environmentId;
        case 'TargetEnvironment': return this.targetEnvironment;
        case 'TargetEnvironmentId': return this.targetEnvironmentId;
        case 'Notes': return this.notes;
        case 'RestoreTimeStamp': return this.restoreTimeStamp;
        case 'OverrideFriendlyName': return 'true';
        case 'FriendlyName': return this.friendlyName;
        case 'CopyType': return this.copyType;
        case 'Purpose': return this.purpose;
        case 'BuildVersion': return this.buildVersion;
        case 'TeamId': return this.teamId;
        case "User": return this.user;
        case "Role": return this.role;
        case "SchemaFile": return this.schemaFile;
        case "DataFile": return this.dataFile;
        case "DataDirectory": return this.dataDirectory;
        case "Component": return this.incidentTableName;
        case "ComponentType": return this.tableComponentType.toString();
        case "ApplicationUser": return this.applicationUser;
        case "BusinessUnit": return this.businessUnit;
        case "TeamType": return this.teamType.toString();
        case "MembershipType": return this.membershipType.toString();
        case "AzureAadGroup": return this.azureAadGroup;
        case "GroupName": return this.name;
        case "BotId": return this.botId;
        case "CatalogItemId": return this.catalogItemId;
        default: {
          return candidateValue || `<<input param '${entry.name}' is required but undefined>>`;
        }
      }
    } else {
      return candidateValue;
    }

  }

  public getArtifactStore(): IArtifactStore {
    return new MockArtifactStore();
  }
}

export class MockArtifactStore implements IArtifactStore {

  public getTempFolder(): string {
    return path.join(os.tmpdir(), 'test');
  }

  public upload(artifactName: string, files: string[]): Promise<void> {
    console.log(`MockArtifactStore: name = ${artifactName}, files = ${files.join(', ')}`);
    return Promise.resolve();
   }
}
