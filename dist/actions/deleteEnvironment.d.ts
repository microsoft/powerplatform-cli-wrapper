import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface DeleteEnvironmentParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
}
export declare function deleteEnvironment(parameters: DeleteEnvironmentParameters, runnerParameters: RunnerParameters): Promise<void>;
