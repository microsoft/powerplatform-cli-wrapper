import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface UpgradeSolutionParameters {
    name: string;
    credentials: AuthCredentials;
    environmentUrl: string;
    async?: boolean;
    maxAsyncWaitTimeInMin?: number;
}
export declare function upgradeSolution(parameters: UpgradeSolutionParameters, runnerParameters: RunnerParameters): Promise<void>;
