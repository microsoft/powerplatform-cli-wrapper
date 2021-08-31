import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputValidator } from "../host/InputValidator";
import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import path = require("path");

export interface CheckSolutionParameters 
{
  credentials: AuthCredentials;
  environmentUrl: string;
  solutionPath: HostParameterEntry;
  outputDirectory?: HostParameterEntry;
  geoInstance?: HostParameterEntry;
  ruleLevelOverride?: HostParameterEntry;
  useDefaultPACheckerEndpoint: HostParameterEntry;
  customPACheckerEndpoint?: HostParameterEntry;
  fileLocation: HostParameterEntry;
  filesToAnalyze: HostParameterEntry;
  filesToAnalyzeSasUri?: HostParameterEntry;
  filesToExclude?: HostParameterEntry;
  ruleSet: HostParameterEntry;
  errorLevel: HostParameterEntry;
  errorThreshold: HostParameterEntry;
  failOnPowerAppsCheckerAnalysisError: HostParameterEntry;
  artifactDestinationName: HostParameterEntry;
}

export async function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const pacArgs = ["solution", "check"]
  const validator = new InputValidator(host);

  const solutionPath = host.getInput(parameters.solutionPath);
  if (solutionPath === undefined) {
    throw new Error("This error should never occur, solution path is undefined, it must always be set by host.");
  }
  pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));
  pacArgs.push("--errorThreshold", validator.getIntInput(parameters.errorThreshold));
  pacArgs.push("--failOnPowerAppsCheckerAnalysisError", validator.getBoolInput(parameters.failOnPowerAppsCheckerAnalysisError));

  if (validator.isEntryValid(parameters.outputDirectory)) { 
    const outputDirectory = host.getInput(parameters.outputDirectory);
    if (outputDirectory !== undefined)
      pacArgs.push("--outputDirectory", outputDirectory); 
  }
  if (validator.isEntryValid(parameters.geoInstance)) { 
    const geoInstance = host.getInput(parameters.geoInstance);
    if (geoInstance !== undefined)
      pacArgs.push("--geo", geoInstance); 
  }
  if (validator.isEntryValid(parameters.ruleLevelOverride)) {
    const ruleLevelOverride = host.getInput(parameters.ruleLevelOverride);
    if (ruleLevelOverride !== undefined) 
      pacArgs.push("--ruleLevelOverride", ruleLevelOverride); 
  }
  if (validator.getBoolInput(parameters.useDefaultPACheckerEndpoint) === "true" && validator.isEntryValid(parameters.customPACheckerEndpoint)) {
    const settingsFile = host.getInput(parameters.customPACheckerEndpoint);
    if (settingsFile !== undefined)
      pacArgs.push("--customPACheckerEndpoint", settingsFile);
  }
  const fileLocation = validator.getValidEntryOrDefault(parameters.fileLocation);
  if (fileLocation == 'localFiles') {
    pacArgs.push("--filesToAnalyze", validator.getValidEntryOrDefault(parameters.filesToAnalyze));
  } else if (fileLocation == 'sasUriFile' && validator.isEntryValid(parameters.filesToAnalyzeSasUri)) {
    const filesToAnalyzeSasUri = host.getInput(parameters.filesToAnalyzeSasUri);
    if (filesToAnalyzeSasUri !== undefined) 
      pacArgs.push("--filesToAnalyzeSasUri", filesToAnalyzeSasUri); 
  }
  if (validator.isEntryValid(parameters.filesToExclude)) {
    const filesToExclude = host.getInput(parameters.filesToExclude);
    if (filesToExclude !== undefined) 
      pacArgs.push("--filesToExclude", filesToExclude); 
  }
  const ruleSet = host.getInput(parameters.ruleSet);
  if (ruleSet === undefined) {
    throw new Error("Select a rule set that will be executed as part of this build.");
  }
  pacArgs.push("--ruleSet", ruleSet); 
  pacArgs.push("--errorLevel", validator.getValidEntryOrDefault(parameters.errorLevel));
  pacArgs.push("--artifactDestinationName", validator.getValidEntryOrDefault(parameters.artifactDestinationName)); 
  
  await pac(...pacArgs);
}
