import { HostParameterEntry, IHostAbstractions, CommonActionParameters } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface ExportSolutionParameters extends CommonActionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  name: HostParameterEntry;
  path: HostParameterEntry;
  managed: HostParameterEntry;
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
  overwrite: HostParameterEntry;
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  function resolveFolder(folder: string | boolean | undefined): string | undefined {
    if (!folder || typeof folder !== "string") return undefined;
    return path.resolve(runnerParameters.workingDir, folder);
  }

  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "export"];
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--name", parameters.name);
    validator.pushInput(pacArgs, "--path", parameters.path, resolveFolder);
    validator.pushInput(pacArgs, "--overwrite", parameters.overwrite);
    validator.pushInput(pacArgs, "--managed", parameters.managed);
    validator.pushInput(pacArgs, "--async", parameters.async);
    validator.pushInput(pacArgs, "--max-async-wait-time", parameters.maxAsyncWaitTimeInMin);

    const includeArgs = [];
    if (validator.getInput(parameters.autoNumberSettings)?.toLowerCase() === 'true') { includeArgs.push("autonumbering"); }
    if (validator.getInput(parameters.calenderSettings)?.toLowerCase() === 'true') { includeArgs.push("calendar"); }
    if (validator.getInput(parameters.customizationSettings)?.toLowerCase() === 'true') { includeArgs.push("customization"); }
    if (validator.getInput(parameters.emailTrackingSettings)?.toLowerCase() === 'true') { includeArgs.push("emailtracking"); }
    if (validator.getInput(parameters.externalApplicationSettings)?.toLowerCase() === 'true') { includeArgs.push("externalapplications"); }
    if (validator.getInput(parameters.generalSettings)?.toLowerCase() === 'true') { includeArgs.push("general"); }
    if (validator.getInput(parameters.isvConfig)?.toLowerCase() === 'true') { includeArgs.push("isvconfig"); }
    if (validator.getInput(parameters.marketingSettings)?.toLowerCase() === 'true') { includeArgs.push("marketing"); }
    if (validator.getInput(parameters.outlookSynchronizationSettings)?.toLowerCase() === 'true') { includeArgs.push("outlooksynchronization"); }
    if (validator.getInput(parameters.relationshipRoles)?.toLowerCase() === 'true') { includeArgs.push("relationshiproles"); }
    if (validator.getInput(parameters.sales)?.toLowerCase() === 'true') { includeArgs.push("sales"); }
    if (includeArgs.length > 0) { pacArgs.push("--include", includeArgs.join(',')); }
    validator.pushCommon(pacArgs, parameters);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("ExportSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}
