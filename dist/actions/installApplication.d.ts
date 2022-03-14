import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface InstallApplicationParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    environmentId: HostParameterEntry;
    applicationName: HostParameterEntry;
    applicationList: HostParameterEntry;
}
export declare function installApplication(parameters: InstallApplicationParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
