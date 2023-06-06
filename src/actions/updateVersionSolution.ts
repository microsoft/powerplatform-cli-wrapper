import fs = require("fs-extra");
import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface UpdateVersionSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  buildVersion?: HostParameterEntry;
  revisionVersion?: HostParameterEntry;
  patchVersion?: HostParameterEntry;
  strategy: HostParameterEntry;
  fileName: HostParameterEntry;
}

export async function updateVersionSolution(parameters: UpdateVersionSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const [pac, pacLogs] = createPacRunner(runnerParameters);

  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl, logger);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "version"]
    const validator = new InputValidator(host);

    validator.pushInput(pacArgs, "--buildversion", parameters.buildVersion);
    validator.pushInput(pacArgs, "--revisionversion", parameters.revisionVersion);
    validator.pushInput(pacArgs, "--patchversion", parameters.patchVersion);
    validator.pushInput(pacArgs, "--strategy", parameters.strategy);
    validator.pushInput(pacArgs, "--filename", parameters.fileName);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    const pacResult = await pac(...pacArgs);
    logger.log("UpdateVersionSolution Action Result: " + pacResult);
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
    if (fs.pathExistsSync(pacLogs)) {
      host.getArtifactStore().upload('PacLogs', [pacLogs]);
    }
  }
}
