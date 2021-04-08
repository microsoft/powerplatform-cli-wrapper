import { CommandRunner } from "../CommandRunner";

export interface ExportSolutionParameters {
  name: string;
  path: string;
}

export function exportSolution(
  pac: CommandRunner,
  { name, path }: ExportSolutionParameters
): Promise<string[]> {
  // Handle export parameters

  return pac("solution", "export", "--name", name, "--path", path);
}
