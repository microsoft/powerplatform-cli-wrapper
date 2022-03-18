import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { EnvironmentResult } from "../actions/createEnvironment";
export interface RestoreEnvironmentParameters {
    credentials: AuthCredentials;
    sourceEnvironment?: HostParameterEntry;
    targetEnvironment?: HostParameterEntry;
    sourceEnvironmentUrl?: HostParameterEntry;
    targetEnvironmentUrl?: HostParameterEntry;
    sourceEnvironmentId?: HostParameterEntry;
    targetEnvironmentId?: HostParameterEntry;
    restoreLatestBackup: HostParameterEntry;
    backupDateTime?: HostParameterEntry;
    targetEnvironmentName: HostParameterEntry;
}
export declare function restoreEnvironment(parameters: RestoreEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult>;
