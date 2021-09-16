import { RunnerParameters } from "../Parameters";
import { AuthCredentials } from "../pac/auth/authParameters";
export interface WhoAmIParameters {
    credentials: AuthCredentials;
    environmentUrl: string;
}
export declare function whoAmI(parameters: WhoAmIParameters, runnerParameters: RunnerParameters): Promise<void>;
