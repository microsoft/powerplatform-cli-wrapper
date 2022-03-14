import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface DeployPackageParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    packagePath: HostParameterEntry;
    logFile?: HostParameterEntry;
    logConsole?: HostParameterEntry;
}
export declare function deployPackage(parameters: DeployPackageParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
