import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { InputPacValidator } from "../host/InputPacValidator";
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
  ruleLevelOverride: HostParameterEntry;
  useDefaultPACheckerEndpoint: HostParameterEntry;
  customPACheckerEndpoint?: HostParameterEntry;
  fileLocation: HostParameterEntry;
  filesToAnalyze: HostParameterEntry;
  filesToAnalyzeSasUri?: HostParameterEntry;
  filesToExclude: HostParameterEntry;
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

  const solutionPath = host.getInput(parameters.solutionPath);
  if (solutionPath === undefined) {
    throw new Error("This error should never occur, solution path is undefined, it must always be set by host.");
  }
  pacArgs.push("--path", path.resolve(runnerParameters.workingDir, solutionPath));
  const ruleSet = host.getInput(parameters.ruleSet);
  if (ruleSet === undefined) {
    throw new Error("Select a rule set that will be executed as part of this build.");
  }
  pacArgs.push("--ruleSet", ruleSet);
  const validator = new InputPacValidator(host, pacArgs);
  validator.pushIntInput(parameters.errorThreshold, "--errorThreshold");
  validator.pushBoolInput(parameters.failOnPowerAppsCheckerAnalysisError, "--failOnPowerAppsCheckerAnalysisError");
  validator.pushValidStringEntryOrDefault(parameters.outputDirectory, "--outputDirectory");
  validator.pushValidStringEntryOrDefault(parameters.geoInstance, "--geo");
  validator.pushValidStringEntryOrDefault(parameters.ruleLevelOverride, "--ruleLevelOverride");
  if (validator.getBoolInput(parameters.useDefaultPACheckerEndpoint) === "true") {
    validator.pushValidStringEntryOrDefault(parameters.customPACheckerEndpoint, "--customPACheckerEndpoint");
  }
  const fileLocation = validator.getValidEntryOrDefault(parameters.fileLocation);
  if (fileLocation == 'localFiles') {
    validator.pushValidStringEntryOrDefault(parameters.filesToAnalyze, "--filesToAnalyze");
  } else if (fileLocation == 'sasUriFile') {
    validator.pushValidStringEntryOrDefault(parameters.filesToAnalyzeSasUri, "--filesToAnalyzeSasUri");
  }
  validator.pushValidStringEntryOrDefault(parameters.filesToExclude, "--filesToExclude");
  validator.pushValidStringEntryOrDefault(parameters.errorLevel, "--errorLevel");
  validator.pushValidStringEntryOrDefault(parameters.artifactDestinationName, "--artifactDestinationName");
  
  await pac(...pacArgs);
}
