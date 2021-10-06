import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
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

  validator.pushInput(pacArgs, "--name", parameters.name);
  validator.pushInput(pacArgs, "--path", parameters.path, (value) => path.resolve(runnerParameters.workingDir, value));
  validator.pushInput(pacArgs, "--managed", parameters.managed);
  validator.pushInput(pacArgs, "--async", parameters.async);
  validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);
  validator.pushInput(pacArgs, "--targetversion", parameters.targetVersion);

  const includeArgs = [];
  if (validator.getInput(parameters.autoNumberSettings) === 'true') { includeArgs.push("autonumbering"); }
  if (validator.getInput(parameters.calenderSettings) === 'true') { includeArgs.push("calendar"); }
  if (validator.getInput(parameters.customizationSettings) === 'true') { includeArgs.push("customization"); }
  if (validator.getInput(parameters.emailTrackingSettings) === 'true') { includeArgs.push("emailtracking"); }
  if (validator.getInput(parameters.externalApplicationSettings) === 'true') { includeArgs.push("externalapplications"); }
  if (validator.getInput(parameters.generalSettings) === 'true') { includeArgs.push("general"); }
  if (validator.getInput(parameters.isvConfig) === 'true') { includeArgs.push("isvconfig"); }
  if (validator.getInput(parameters.marketingSettings) === 'true') { includeArgs.push("marketing"); }
  if (validator.getInput(parameters.outlookSynchronizationSettings) === 'true') { includeArgs.push("outlooksynchronization"); }
  if (validator.getInput(parameters.relationshipRoles) === 'true') { includeArgs.push("relationshiproles"); }
  if (validator.getInput(parameters.sales) === 'true') { includeArgs.push("sales"); }
  if (includeArgs.length > 0) { pacArgs.push("--include", includeArgs.join(',')); }

  await pac(...pacArgs);
  await clearAuthentication(pac);
}
