import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
import { EnvironmentResult } from "../actions/createEnvironment";
export interface ResetEnvironmentParameters {
    credentials: AuthCredentials;
    environment?: HostParameterEntry;
    environmentUrl?: HostParameterEntry;
    environmentId?: HostParameterEntry;
    currency: HostParameterEntry;
    purpose: HostParameterEntry;
    templates: HostParameterEntry;
    language: HostParameterEntry;
    overrideDomainName: HostParameterEntry;
    domainName?: HostParameterEntry;
    overrideFriendlyName: HostParameterEntry;
    friendlyEnvironmentName?: HostParameterEntry;
}
export declare function resetEnvironment(parameters: ResetEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult>;
