import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { EnvironmentUrlParameters, CredentialsParameters } from "../pac/auth/authParameters";

export interface ImportSolutionParameters extends CredentialsParameters, RunnerParameters, EnvironmentUrlParameters
{
  actionParameters: {path: string;};
  optionalParameters?: {activatePlugins?: boolean; forceOverwrite?: boolean; skipDependencyCheck?: boolean; 
    importAsHolding?: boolean; publishChanges?: boolean; convertToManaged?: boolean; async?: boolean; maxAsyncWaitTimeInMin?: number;};
}

export async function importSolution(parameters: ImportSolutionParameters): Promise<void> 
{
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  const {path} = parameters.actionParameters;
  const importArgs = ["solution", "import", "--path", path];
  if(parameters.optionalParameters && parameters.optionalParameters.activatePlugins) { importArgs.push("--activate-plugins"); }
  if(parameters.optionalParameters && parameters.optionalParameters.forceOverwrite) { importArgs.push("--force-overwrite"); }
  if(parameters.optionalParameters && parameters.optionalParameters.skipDependencyCheck) { importArgs.push("--skip-dependency-check"); }
  if(parameters.optionalParameters && parameters.optionalParameters.importAsHolding) { importArgs.push("--import-as-holding"); }
  if(parameters.optionalParameters && parameters.optionalParameters.publishChanges) { importArgs.push("--publish-changes"); }
  if(parameters.optionalParameters && parameters.optionalParameters.convertToManaged) { importArgs.push("--convert-to-managed"); }
  if(parameters.optionalParameters && parameters.optionalParameters.async) { importArgs.push("--async"); }
  if(parameters.optionalParameters && parameters.optionalParameters.maxAsyncWaitTimeInMin) { importArgs.push('--max-async-wait-time', parameters.optionalParameters.maxAsyncWaitTimeInMin.toString()); }
  await pac(...importArgs);
}
