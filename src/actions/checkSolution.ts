import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
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
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials);
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
      pacArgs.push("--customEndpoint", getPACheckerEndpoint(parameters.environmentUrl));
    }
    else {
      validator.pushInput(pacArgs, "--customEndpoint", parameters.customPAEndpoint);
    }

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    //pacResult is not in any contractual format. It is an array similar to the one in checkSolution.test.ts
    const pacResult = await pac(...pacArgs);
    logger.log("CheckSolution Action Result: " + pacResult);

    const status = pacResult[pacResult.length - 7].split(' ')[2];
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

function getPACheckerEndpoint(environmentUrl: string): string {
  const url = new URL(environmentUrl);
  const domainName = url.hostname.split(".").splice(1, 3).join(".");
  let paCheckerEndPoint = 'https://unitedstates.api.advisor.powerapps.com/';
  
  switch (domainName) {
    case 'crm2.dynamics.com':
      paCheckerEndPoint = 'https://southamerica.api.advisor.powerapps.com/';
      break;
    case 'crm3.dynamics.com':
      paCheckerEndPoint = 'https://canada.api.advisor.powerapps.com/';
      break;
    case 'crm4.dynamics.com':
      paCheckerEndPoint = 'https://europe.api.advisor.powerapps.com/';
      break;
    case 'crm5.dynamics.com':
      paCheckerEndPoint = 'https://asia.api.advisor.powerapps.com/';
      break;
    case 'crm6.dynamics.com':
      paCheckerEndPoint = 'https://australia.api.advisor.powerapps.com/';
      break;
    case 'crm7.dynamics.com':
      paCheckerEndPoint = 'https://japan.api.advisor.powerapps.com/';
      break;
    case 'crm8.dynamics.com':
      paCheckerEndPoint = 'https://india.api.advisor.powerapps.com/';
      break;
    case 'crm9.dynamics.com':
      paCheckerEndPoint = 'https://gov.api.advisor.powerapps.us/';
      break;
    case 'crm11.dynamics.com':
      paCheckerEndPoint = 'https://unitedkingdom.api.advisor.powerapps.com/';
      break;
    case 'crm12.dynamics.com':
      paCheckerEndPoint = 'https://france.api.advisor.powerapps.com/';
      break;
    case 'crm15.dynamics.com':
      paCheckerEndPoint = 'https://unitedarabemirates.api.advisor.powerapps.com/';
      break;
    case 'crm16.dynamics.com':
      paCheckerEndPoint = 'https://germany.api.advisor.powerapps.com/';
      break;
    case 'crm17.dynamics.com':
      paCheckerEndPoint = 'https://switzerland.api.advisor.powerapps.com/';
      break;
    case 'crm.dynamics.cn':
      paCheckerEndPoint = 'https://china.api.advisor.powerapps.cn/';
      break;
    case 'crm.microsoftdynamics.us':
      paCheckerEndPoint = 'https://high.api.advisor.powerapps.us/';
      break;
    case 'crm.appsplatforms.us':
      paCheckerEndPoint = 'https://mil.api.advisor.appsplatform.us/';
      break;
  }
  return paCheckerEndPoint;
}

function errorCheck(pacResults: string[], errorLevel: string, errorThreshold: number): void {
  const errors: Record<string, number> = {};
  const PAErrorLevels = pacResults[pacResults.length - 5].trim().split(/\s+/);
  const PAErrorValues = pacResults[pacResults.length - 3].trim().split(/\s+/);

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
