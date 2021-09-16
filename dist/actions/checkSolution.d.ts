import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface CheckSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    solutionPath: HostParameterEntry;
    geoInstance?: HostParameterEntry;
    ruleLevelOverride: HostParameterEntry;
}
export declare function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
