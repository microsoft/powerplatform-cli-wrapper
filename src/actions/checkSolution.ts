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
  fileLocation?: HostParameterEntry;
  filesToAnalyze?: HostParameterEntry;
  filesToAnalyzeSasUri?: HostParameterEntry;
  filesToExclude?: HostParameterEntry;
  ruleSet?: HostParameterEntry;
  errorLevel: HostParameterEntry;
  errorThreshold: HostParameterEntry;
  failOnPowerAppsCheckerAnalysisError: HostParameterEntry;
  artifactDestinationName?: HostParameterEntry;
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
  if (validator.isEntryValid(parameters.fileLocation)) {
    const fileLocation = host.getInput(parameters.fileLocation);
    if (fileLocation !== undefined) 
      pacArgs.push("--fileLocation", fileLocation); 
  }
  if (validator.isEntryValid(parameters.filesToAnalyze)) {
    const filesToAnalyze = host.getInput(parameters.filesToAnalyze);
    if (filesToAnalyze !== undefined) 
      pacArgs.push("--filesToAnalyze", filesToAnalyze); 
  }
  if (validator.isEntryValid(parameters.filesToAnalyzeSasUri)) {
    const filesToAnalyzeSasUri = host.getInput(parameters.filesToAnalyzeSasUri);
    if (filesToAnalyzeSasUri !== undefined) 
      pacArgs.push("--filesToAnalyzeSasUri", filesToAnalyzeSasUri); 
  }
  if (validator.isEntryValid(parameters.filesToExclude)) {
    const filesToExclude = host.getInput(parameters.filesToExclude);
    if (filesToExclude !== undefined) 
      pacArgs.push("--filesToExclude", filesToExclude); 
  }
  if (validator.isEntryValid(parameters.ruleSet)) {
    const ruleSet = host.getInput(parameters.ruleSet);
    if (ruleSet !== undefined) 
      pacArgs.push("--ruleSet", ruleSet); 
  }
  if (validator.isEntryValid(parameters.errorLevel)) {
    const errorLevel = host.getInput(parameters.errorLevel);
    if (errorLevel !== undefined) 
      pacArgs.push("--errorLevel", errorLevel); 
  }
  if (validator.isEntryValid(parameters.artifactDestinationName)) {
    const artifactDestinationName = host.getInput(parameters.artifactDestinationName);
    if (artifactDestinationName !== undefined) 
      pacArgs.push("--artifactDestinationName", artifactDestinationName); 
  }
  
  await pac(...pacArgs);
}
