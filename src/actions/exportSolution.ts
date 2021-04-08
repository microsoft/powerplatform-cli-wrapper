import { authenticateEnvironment } from "../pac/auth/authenticate";
import CredentialsParameters from "../pac/auth/CredentialsParameters";
import EnvironmentUrlParameters from "../pac/auth/EnvironmentUrlParameters";
import createPacRunner from "../pac/createPacRunner";
import RunnerParameters from "../RunnerParameters";
import {
  exportSolution,
  ExportSolutionParameters,
} from "../pac/exportSolution";

export default async function (
  parameters: RunnerParameters &
    CredentialsParameters &
    EnvironmentUrlParameters &
    ExportSolutionParameters
): Promise<void> {
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  await exportSolution(pac, parameters);
}
