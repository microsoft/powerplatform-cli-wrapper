import { HostParameterEntry, IHostAbstractions } from "../host/IHostAbstractions";
import { AuthCredentials } from "../pac/auth/authParameters";
import { RunnerParameters } from "../Parameters";
export interface ImportSolutionParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
    path: HostParameterEntry;
    useDeploymentSettingsFile: HostParameterEntry;
    deploymentSettingsFile?: HostParameterEntry;
    async: HostParameterEntry;
    maxAsyncWaitTimeInMin: HostParameterEntry;
    importAsHolding: HostParameterEntry;
    forceOverwrite: HostParameterEntry;
    publishChanges: HostParameterEntry;
    skipDependencyCheck: HostParameterEntry;
    convertToManaged: HostParameterEntry;
    activatePlugins: HostParameterEntry;
}
export declare function importSolution(parameters: ImportSolutionParameters, runnerParameters: RunnerParameters, host: IHostAbstractions): Promise<void>;
