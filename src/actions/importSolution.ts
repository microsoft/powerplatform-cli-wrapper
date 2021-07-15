import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ImportSolutionParameters {
  /** Path to the solution zip file; relative to the working directory (configured in the runner parameters). */
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

export async function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> {
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);

  const pacArgs = ["solution", "import", "--path", parameters.path];
  if (parameters.activatePlugins) { pacArgs.push("--activate-plugins"); }
  if (parameters.forceOverwrite) { pacArgs.push("--force-overwrite"); }
  if (parameters.skipDependencyCheck) { pacArgs.push("--skip-dependency-check"); }
  if (parameters.importAsHolding) { pacArgs.push("--import-as-holding"); }
  if (parameters.publishChanges) { pacArgs.push("--publish-changes"); }
  if (parameters.convertToManaged) { pacArgs.push("--convert-to-managed"); }
  if (parameters.async) { pacArgs.push("--async"); }
  if (typeof parameters.maxAsyncWaitTimeInMin == 'number') { pacArgs.push('--max-async-wait-time', parameters.maxAsyncWaitTimeInMin.toString()); }
  
  await pac(...pacArgs);
}
