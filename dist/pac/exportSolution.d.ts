import { CommandRunner } from "../CommandRunner";
import RunnerParameters from "../RunnerParameters";
import CredentialsParameters from "./auth/CredentialsParameters";
import EnvironmentUrlParameters from "./auth/EnvironmentUrlParameters";
export interface ExportSolutionParameters extends CredentialsParameters, RunnerParameters, EnvironmentUrlParameters {
    actionParameters: {
        name: string;
        path: string;
    };
}
export declare function exportSolution(pac: CommandRunner, { actionParameters: { name, path } }: ExportSolutionParameters): Promise<string[]>;
