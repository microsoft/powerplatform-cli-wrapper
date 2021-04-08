import { authenticateEnvironment } from "../pac/auth/authenticate";
import createPacRunner from "../pac/createPacRunner";

import {
  exportSolution,
  ExportSolutionParameters,
} from "../pac/exportSolution";

export default async function (
  parameters: ExportSolutionParameters
): Promise<void> {
  const pac = createPacRunner(parameters);
  await authenticateEnvironment(pac, parameters);
  await exportSolution(pac, parameters);
}
