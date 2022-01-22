import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface CheckSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    fileLocation?: HostParameterEntry;
    solutionPath: HostParameterEntry;
    solutionUrl?: HostParameterEntry;
    geoInstance?: HostParameterEntry;
    ruleSet?: HostParameterEntry;
    ruleLevelOverride: HostParameterEntry;
    outputDirectory: HostParameterEntry;
    useDefaultPAEndpoint?: HostParameterEntry;
    customPAEndpoint?: HostParameterEntry;
    filesExcluded?: HostParameterEntry;
    errorLevel?: HostParameterEntry;
    errorThreshold?: HostParameterEntry;
    failOnAnalysisError?: HostParameterEntry;
}
export declare function checkSolution(parameters: CheckSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
