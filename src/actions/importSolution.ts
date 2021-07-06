import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ImportSolutionParameters
{
  // Path to the solution zip file; relative to the working directory (configured in the runner parameters).
  path: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  activatePlugins?: boolean;
  forceOverwrite?: boolean;
  skipDependencyCheck?: boolean; 
  importAsHolding?: boolean;
  publishChanges?: boolean;
  convertToManaged?: boolean;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
}

export async function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const importArgs = ["solution", "import", "--path", parameters.path];

  if(parameters.activatePlugins) { importArgs.push("--activate-plugins"); }
  if(parameters.forceOverwrite) { importArgs.push("--force-overwrite"); }
  if(parameters.skipDependencyCheck) { importArgs.push("--skip-dependency-check"); }
  if(parameters.importAsHolding) { importArgs.push("--import-as-holding"); }
  if(parameters.publishChanges) { importArgs.push("--publish-changes"); }
  if(parameters.convertToManaged) { importArgs.push("--convert-to-managed"); }
  if(parameters.async) { importArgs.push("--async"); }
  if(parameters.maxAsyncWaitTimeInMin) { importArgs.push('--max-async-wait-time', parameters.maxAsyncWaitTimeInMin.toString()); }
  
  await pac(...importArgs);
}
