import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface ListApplicationParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    environmentId: HostParameterEntry;
    output: HostParameterEntry;
}
export declare function listApplication(parameters: ListApplicationParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
