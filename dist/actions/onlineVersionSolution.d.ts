import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface OnlineVersionSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    name: HostParameterEntry;
    version: HostParameterEntry;
}
export declare function onlineVersionSolution(parameters: OnlineVersionSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
