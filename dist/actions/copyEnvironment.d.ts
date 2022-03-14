import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { EnvironmentResult } from "../actions/createEnvironment";
export interface CopyEnvironmentParameters {
    credentials: AuthCredentials;
    sourceEnvironment?: HostParameterEntry;
    targetEnvironment?: HostParameterEntry;
    sourceEnvironmentUrl?: HostParameterEntry;
    targetEnvironmentUrl?: HostParameterEntry;
    sourceEnvironmentId?: HostParameterEntry;
    targetEnvironmentId?: HostParameterEntry;
    overrideFriendlyName: HostParameterEntry;
    friendlyTargetEnvironmentName?: HostParameterEntry;
    copyType: HostParameterEntry;
}
export declare function copyEnvironment(parameters: CopyEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult>;
