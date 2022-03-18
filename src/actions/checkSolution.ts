import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment, clearAuthentication } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface CheckSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  fileLocation?: HostParameterEntry;
  solutionPath: HostParameterEntry;
  solutionUrl?: HostParameterEntry;
  geoInstance?: HostParameterEntry;
  ruleSet?: HostParameterEntry;
  ruleLevelOverride: HostParameterEntry;
  outputDirectory: HostParameterEntry;
  useDefaultPAEndpoint?: HostParameterEntry;
  customPAEndpoint?: HostParameterEntry;
  filesExcluded?: HostParameterEntry;
  errorLevel?: HostParameterEntry;
  errorThreshold?: HostParameterEntry;
  failOnAnalysisError?: HostParameterEntry;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);
  const validator = new InputValidator(host);
  let level: string | undefined;
  let threshold: string | undefined;
  if (parameters.errorLevel != undefined && parameters.errorThreshold != undefined) {
    level = validator.getInput(parameters.errorLevel);
    threshold = validator.getInput(parameters.errorThreshold);
  }
  try {
    const authenticateResult = await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "check"]

    if (parameters.fileLocation != undefined && validator.getInput(parameters.fileLocation) === 'sasUriFile') {
      validator.pushInput(pacArgs, "--solutionUrl", parameters.solutionUrl);
    }
    else {
      validator.pushInput(pacArgs, "--path", parameters.solutionPath, (value) => path.resolve(runnerParameters.workingDir, value));
    }
    validator.pushInput(pacArgs, "--geo", parameters.geoInstance);
    validator.pushInput(pacArgs, "--ruleSet", parameters.ruleSet);
    validator.pushInput(pacArgs, "--ruleLevelOverride", parameters.ruleLevelOverride);
    validator.pushInput(pacArgs, "--outputDirectory", parameters.outputDirectory);
    validator.pushInput(pacArgs, "--excludedFiles", parameters.filesExcluded);

    if (parameters.useDefaultPAEndpoint != undefined && validator.getInput(parameters.useDefaultPAEndpoint) === 'true') {
      pacArgs.push("--customEndpoint", parameters.environmentUrl);
    }
    else {
      validator.pushInput(pacArgs, "--customEndpoint", parameters.customPAEndpoint);
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    //pacResult is not in any contractual format. It is an array similar to the one in checkSolution.test.ts
    const pacResult = await pac(...pacArgs);
    logger.log("CheckSolution Action Result: " + pacResult);

    const status = pacResult[pacResult.length-7].split(' ')[2];
    if (status === 'Failed' || status === 'FinishedWithErrors') {
      throw new Error("PowerApps Checker analysis results indicate a failure or error during the analysis process.");
    }
    if (level != undefined && threshold != undefined) {
      errorCheck(pacResult, level, parseInt(threshold));
    }
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}

function errorCheck(pacResults: string[], errorLevel: string, errorThreshold: number): void {
  const errors: Record<string, number> = {};
  const PAErrorLevels = pacResults[pacResults.length-5].trim().split(/\s+/);
  const PAErrorValues = pacResults[pacResults.length-3].trim().split(/\s+/);

  for (let i = 0; i < PAErrorLevels.length && i < PAErrorValues.length; i++) {
    errors[PAErrorLevels[i]] = parseInt(PAErrorValues[i]);
  }
  const issueCount: Record<string, string> = {
    "CriticalIssueCount": "Critical",
    "HighIssueCount": "High",
    "MediumIssueCount": "Medium",
    "LowIssueCount": "Low",
    "InformationalIssueCount": "Informational"
  };
  
  if (errors[issueCount[errorLevel]] > errorThreshold) {
    throw new Error("Analysis results do not pass with selected error level and threshold choices.  Please review detailed results in SARIF file for more information.");
  }
}
