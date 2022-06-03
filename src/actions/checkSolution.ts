import glob = require("glob");
import os = require("os");
import path = require("path");

import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import createPacRunner from "../pac/createPacRunner";
import { authenticateAdmin, clearAuthentication } from "../pac/auth/authenticate";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { promises, rmdirSync, rmSync, writeFile } from "fs-extra";

export interface CheckSolutionParameters {
  credentials: AuthCredentials;
  environmentUrl: string;
  fileLocation: HostParameterEntry;
  solutionPath: HostParameterEntry;
  solutionUrl: HostParameterEntry;
  geoInstance: HostParameterEntry;
  ruleSet: HostParameterEntry;
  ruleLevelOverride: HostParameterEntry;
  artifactStoreName: HostParameterEntry;
  useDefaultPAEndpoint: HostParameterEntry;
  customPAEndpoint: HostParameterEntry;
  filesExcluded: HostParameterEntry;
  errorLevel: HostParameterEntry;
  errorThreshold: HostParameterEntry;
  failOnAnalysisError: HostParameterEntry;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> {
  const logger = runnerParameters.logger;
  const pac = createPacRunner(runnerParameters);
  const validator = new InputValidator(host);
  const artifactStore = host.getArtifactStore();

  let level: string | undefined;
  let threshold: string | undefined;
  if (parameters.errorThreshold != undefined) {
    level = validator.getInput(parameters.errorLevel);
    threshold = validator.getInput(parameters.errorThreshold);
  }
  const failOnAnalysisError = validator.getInput(parameters.failOnAnalysisError) === 'true';

  let ruleLevelOverrideFile: string | undefined;
  try {
    const authenticateResult = await authenticateAdmin(pac, parameters.credentials);
    logger.log("The Authentication Result: " + authenticateResult);

    const pacArgs = ["solution", "check"]

    if (validator.getInput(parameters.fileLocation) === 'sasUriFile') {
      validator.pushInput(pacArgs, "--solutionUrl", parameters.solutionUrl);
    }
    else {
      validator.pushInput(pacArgs, "--path", parameters.solutionPath, (value) => path.resolve(runnerParameters.workingDir, value));
    }
    validator.pushInput(pacArgs, "--ruleSet", parameters.ruleSet, defaultRulesMapper);
    ruleLevelOverrideFile = await createRuleOverrideFile(validator.getInput(parameters.ruleLevelOverride));
    if (ruleLevelOverrideFile) {
      pacArgs.push( "--ruleLevelOverride", ruleLevelOverrideFile);
    }
    validator.pushInput(pacArgs, "--excludedFiles", parameters.filesExcluded);

    if (validator.getInput(parameters.useDefaultPAEndpoint) !== 'true') {
      // if a custom endpoint is specified, ignore geo to avoid conflict
      // customEndpoint param becomes required if !useDefautlPAEndpoint
      const customEndpoint = validator.getInput(parameters.customPAEndpoint);
      if (!customEndpoint) {
        throw new Error(`Required ${parameters.customPAEndpoint.name} not set`);
      }
      pacArgs.push("--customEndpoint", customEndpoint);
    }
    else {
      // using default endpoint, determine geo instance, either explicitly or infered:
      const geo = validator.getInput(parameters.geoInstance);
      if (geo) {
        pacArgs.push("--geo", geo);
      } else {
        // fallback to infer geo from environment url (will be handled by pac's SolutionCheckVerb)
        pacArgs.push("--customEndpoint", parameters.environmentUrl);
      }
    }
    const outputDirectory = path.join(artifactStore.getTempFolder(), 'checker-output');
    logger.debug(`checker-output folder: ${outputDirectory}`);
    pacArgs.push("--outputDirectory", outputDirectory);

    logger.log("Calling pac cli inputs: " + pacArgs.join(" "));
    //pacResult is not in any contractual format. It is an array similar to the one in checkSolution.test.ts
    const pacResult = await pac(...pacArgs);
    logger.log("CheckSolution Action Result: " + pacResult);

    const files = glob.sync('**/*', { cwd: outputDirectory, absolute: true });
    const artifactStoreName = validator.getInput(parameters.artifactStoreName) || 'CheckSolutionLogs';
    await artifactStore.upload(artifactStoreName, files);

    const status = isolateStatus(pacResult);
    if (status === 'Failed' || status === 'FinishedWithErrors') {
      const msg = "PowerApps Checker analysis results indicate a failure or error during the analysis process.";
      if (failOnAnalysisError) {
        throw new Error(msg);
      } else {
        logger.warn(msg);
      }
    }

    if (level != undefined && threshold != undefined) {
      errorCheck(pacResult, level, parseInt(threshold));
    }
  } catch (error) {
    logger.error(`failed: ${error instanceof Error ? error.message : error}`);
    throw error;
  } finally {
    if (ruleLevelOverrideFile) {
      try {
        rmSync(ruleLevelOverrideFile);
        rmdirSync(path.dirname(ruleLevelOverrideFile));
      } catch { /*  graceful failure if temporary file/dir cleanup fails */ }
    }
    const clearAuthResult = await clearAuthentication(pac);
    logger.log("The Clear Authentication Result: " + clearAuthResult);
  }
}

function isolateStatus(pacResults: string[]): string | undefined {
  for (let i = pacResults.length - 1; i >= 0; i--) {
    const hit = pacResults[i].match(/^\s*Status\s*:\s*(\S+)/i);
    if (hit && hit.length == 2) {
      return hit[1];
    }
  }
}

function errorCheck(pacResults: string[], errorLevel: string, errorThreshold: number): void {
  let issuesLine = -1;
  for (let i = pacResults.length - 1; i >= 0; i--) {
    if (pacResults[i].match(/^\s*Critical\s+High/)) {
      issuesLine = i;
      break;
    }
  }
  if (issuesLine <0) {
    throw Error("Cannot find issues summary line in results!");
  }

  const errors: Record<string, number> = {};
  const PAErrorLevels = pacResults[issuesLine].trim().split(/\s+/);
  const PAErrorValues = pacResults[issuesLine + 2].trim().split(/\s+/);

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

async function createRuleOverrideFile(ruleOverrideJson: string | undefined): Promise<string | undefined> {
  if (ruleOverrideJson) {
    const overrideFile = path.join(await promises.mkdtemp(path.join(os.tmpdir(), 'checker-')), "overrideRule.json");
    await writeFile(overrideFile, ruleOverrideJson);
    return overrideFile;
  }
  return undefined;
}

function defaultRulesMapper(rule: string): string {
  switch (rule) {
    case "AppSource Certification": return "083a2ef5-7e0e-4754-9d88-9455142dc08b";
    case "Solution Checker": return "0ad12346-e108-40b8-a956-9a8f95ea18c9";

    default:
      return rule;
  }
}
