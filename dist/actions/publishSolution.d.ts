import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface PublishSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
}
export declare function publishSolution(parameters: PublishSolutionParameters, runnerParameters: RunnerParameters): Promise<void>;
