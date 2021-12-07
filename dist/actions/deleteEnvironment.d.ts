import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface DeleteEnvironmentParameters {
    credentials: AuthCredentials;
    environmentUrl: HostParameterEntry;
}
export declare function deleteEnvironment(parameters: DeleteEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
