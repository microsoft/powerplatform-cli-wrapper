import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface UpgradeSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    name: HostParameterEntry;
    async: HostParameterEntry;
    maxAsyncWaitTimeInMin: HostParameterEntry;
}
export declare function upgradeSolution(parameters: UpgradeSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
