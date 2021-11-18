import { CommandRunner } from "../../CommandRunner";
import { AuthCredentials } from "./authParameters";
export declare function authenticateAdmin(pac: CommandRunner, credentials: AuthCredentials): Promise<string[]>;
export declare function authenticateEnvironment(pac: CommandRunner, credentials: AuthCredentials, environmentUrl: string): Promise<string[]>;
export declare function clearAuthentication(pac: CommandRunner): Promise<string[]>;
