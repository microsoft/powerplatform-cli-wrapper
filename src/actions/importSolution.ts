import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { ImportSolutionParameters, RunnerParameters } from "../Parameters";

export async function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters);
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
