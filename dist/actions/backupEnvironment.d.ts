import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface BackupEnvironmentParameters {
    credentials: AuthCredentials;
    environment?: HostParameterEntry;
    environmentUrl?: HostParameterEntry;
    environmentId?: HostParameterEntry;
    backupLabel: HostParameterEntry;
    notes: HostParameterEntry;
}
export declare function backupEnvironment(parameters: BackupEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
