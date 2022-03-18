import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface CreateEnvironmentParameters {
    credentials: AuthCredentials;
    environmentName: HostParameterEntry;
    environmentType: HostParameterEntry;
    region: HostParameterEntry;
    currency: HostParameterEntry;
    language: HostParameterEntry;
    templates: HostParameterEntry;
    domainName: HostParameterEntry;
}
export interface EnvironmentResult {
    environmentId?: string;
    environmentUrl?: string;
}
export declare function createEnvironment(parameters: CreateEnvironmentParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<EnvironmentResult>;
export declare function getEnvironmentDetails(pacResult: string[]): EnvironmentResult;
