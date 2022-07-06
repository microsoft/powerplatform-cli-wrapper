import { CommandRunner } from "../../CommandRunner";
import { ClientCredentials, AuthCredentials, UsernamePassword } from "./authParameters";

export function authenticateAdmin(pac: CommandRunner, credentials: AuthCredentials): Promise<string[]> {
  return pac("auth", "create", "--kind", "ADMIN", ...addCredentials(credentials), ...addCloudInstance(credentials));
}

export function authenticateEnvironment(pac: CommandRunner, credentials: AuthCredentials, environmentUrl: string): Promise<string[]> {
  return pac("auth", "create", ...addUrl(environmentUrl), ...addCredentials(credentials), ...addCloudInstance(credentials));
}

export function clearAuthentication(pac: CommandRunner): Promise<string[]> {
  return pac("auth", "clear");
}

function addUrl(url: string) {
  return ["--url", url];
}

function addCredentials(credentials: AuthCredentials) {
  return isUsernamePassword(credentials) ? addUsernamePassword(credentials) : addClientCredentials(credentials);
}

function isUsernamePassword(credentials: AuthCredentials): credentials is UsernamePassword {
  return "username" in credentials;
}

function addClientCredentials(parameters: ClientCredentials) {
  process.env.PAC_CLI_SPN_SECRET = parameters.clientSecret;
  return ["--tenant", parameters.tenantId, "--applicationId", parameters.appId, "--clientSecret", parameters.clientSecret];
}

function addUsernamePassword(parameters: UsernamePassword) {
  return ["--username", parameters.username, "--password", parameters.password];
}

function addCloudInstance(parameters: AuthCredentials) {
  const cloudInstance = parameters.cloudInstance || 'Public';
  return [ "--cloud", cloudInstance ];
}
