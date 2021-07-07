import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";

export interface ExportSolutionParameters
{
  // Name of the solution to be exported
  name: string;
  // Path to the solution zip file; relative to the working directory (configured in the runner parameters).
  path: string;
  credentials: AuthCredentials;
  environmentUrl: string;
  managed?: boolean;
  targetVersion?: string;
  async?: boolean;
  maxAsyncWaitTimeInMin?: number;
  autonumbering?: boolean;
  calendar?: boolean;
  customization?: boolean;
  emailtracking?: boolean;
  externalapplications?: boolean;
  general?: boolean;
  isvconfig?: boolean;
  marketing?: boolean;
  outlooksynchronization?: boolean;
  relationshiproles?: boolean;
  sales?: boolean;
}

export async function exportSolution(parameters: ExportSolutionParameters, runnerParameters: RunnerParameters): Promise<void> 
{
  const pac = createPacRunner(runnerParameters);
  await authenticateEnvironment(pac, parameters.credentials, parameters.environmentUrl);
  const exportArgs = ["solution", "export", "--name", parameters.name, "--path", parameters.path];

  if(parameters.managed) { exportArgs.push("--managed"); }
  if(parameters.targetVersion) { exportArgs.push("--targetversion", parameters.targetVersion); }
  if(parameters.async) { exportArgs.push("--async"); }
  if(parameters.maxAsyncWaitTimeInMin) { exportArgs.push("--max-async-wait-time", parameters.maxAsyncWaitTimeInMin.toString()); }

  const includeArgs = [];
  if(parameters.autonumbering) { includeArgs.push("autonumbering"); }
  if(parameters.calendar) { includeArgs.push("calendar"); }
  if(parameters.customization) { includeArgs.push("customization"); }
  if(parameters.emailtracking) { includeArgs.push("emailtracking"); }
  if(parameters.externalapplications) { includeArgs.push("externalapplications"); }
  if(parameters.general) { includeArgs.push("general"); }
  if(parameters.isvconfig) { includeArgs.push("isvconfig"); }
  if(parameters.marketing) { includeArgs.push("marketing"); }
  if(parameters.outlooksynchronization) { includeArgs.push("outlooksynchronization"); }
  if(parameters.relationshiproles) { includeArgs.push("relationshiproles"); }
  if(parameters.sales) { includeArgs.push("sales"); }
  if(includeArgs) { exportArgs.push("--include", includeArgs.toString()); }

  await pac(...exportArgs);
}
