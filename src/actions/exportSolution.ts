import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface ExportSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  name: HostParameterEntry;
  path: HostParameterEntry;
  managed: HostParameterEntry;
  targetVersion: HostParameterEntry;
  async: HostParameterEntry;
  maxAsyncWaitTimeInMin: HostParameterEntry;
  autoNumberSettings: HostParameterEntry;
  calenderSettings: HostParameterEntry;
  customizationSettings: HostParameterEntry;
  emailTrackingSettings: HostParameterEntry;
  externalApplicationSettings: HostParameterEntry;
  generalSettings: HostParameterEntry;
  isvConfig: HostParameterEntry;
  marketingSettings: HostParameterEntry;
  outlookSynchronizationSettings: HostParameterEntry;
  relationshipRoles: HostParameterEntry;
  sales: HostParameterEntry;
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  const pacArgs = ["solution", "export"];
  const validator = new InputValidator(host);

  const solutionName = host.getInput(parameters.name);
  if (solutionName === undefined) {
    // This error should never occur
    throw new Error("Solution name is undefined, it must always be set by host.");
  }
  pacArgs.push("--name", solutionName);

  const solutionPath = host.getInput(parameters.path);
  if (solutionPath === undefined) {
    // This error should never occur
    throw new Error("Solution path is undefined, it must always be set by host.");
  }
  pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));

  pacArgs.push("--managed", validator.getBoolInput(parameters.managed));
  pacArgs.push("--async", validator.getBoolInput(parameters.async));
  pacArgs.push("--max-async-wait-time", validator.getIntInput(parameters.maxAsyncWaitTimeInMin));

  const targetVersion = host.getInput(parameters.targetVersion);
  if (targetVersion !== undefined) {
    pacArgs.push("--targetversion", targetVersion);
  }

  const includeArgs = [];
  if (validator.getBoolInput(parameters.autoNumberSettings) === 'true') { includeArgs.push("autonumbering"); }
  if (validator.getBoolInput(parameters.calenderSettings) === 'true') { includeArgs.push("calendar"); }
  if (validator.getBoolInput(parameters.customizationSettings) === 'true') { includeArgs.push("customization"); }
  if (validator.getBoolInput(parameters.emailTrackingSettings) === 'true') { includeArgs.push("emailtracking"); }
  if (validator.getBoolInput(parameters.externalApplicationSettings) === 'true') { includeArgs.push("externalapplications"); }
  if (validator.getBoolInput(parameters.generalSettings) === 'true') { includeArgs.push("general"); }
  if (validator.getBoolInput(parameters.isvConfig) === 'true') { includeArgs.push("isvconfig"); }
  if (validator.getBoolInput(parameters.marketingSettings) === 'true') { includeArgs.push("marketing"); }
  if (validator.getBoolInput(parameters.outlookSynchronizationSettings) === 'true') { includeArgs.push("outlooksynchronization"); }
  if (validator.getBoolInput(parameters.relationshipRoles) === 'true') { includeArgs.push("relationshiproles"); }
  if (validator.getBoolInput(parameters.sales) === 'true') { includeArgs.push("sales"); }
  if (includeArgs.length > 0) { pacArgs.push("--include", includeArgs.join(',')); }

  await pac(...pacArgs);
}
