import { CommandRunner } from "../../CommandRunner";
import { Logger } from "../../Logger";
import { ClientCredentials, AuthCredentials, UsernamePassword, FederatedCredentials } from "./authParameters";

export function authenticateAdmin(pac: CommandRunner, credentials: AuthCredentials, logger: Logger): Promise<string[]> {
  logger.log(`authN to admin API: authType=${isUsernamePassword(credentials) ? 'UserPass' : 'SPN'}; cloudInstance: ${credentials.cloudInstance || '<not set>'}`);
  return pac("auth", "create", ...addCredentials(credentials), ...addCloudInstance(credentials));
}

export function authenticateEnvironment(pac: CommandRunner, credentials: AuthCredentials, environmentUrl: string, logger: Logger): Promise<string[]> {

  logger.log(`authN to env. authType:${isUsernamePassword(credentials) ? 'UserPass' : 'SPN'} authScheme:${isUsernamePassword(credentials) ? '' : `${credentials.scheme}`}; cloudInstance: ${credentials.cloudInstance || '<not set>'}; envUrl: ${environmentUrl}`);
  return pac("auth", "create", ...addEnvironment(environmentUrl), ...addCredentials(credentials), ...addCloudInstance(credentials));
}

export function clearAuthentication(pac: CommandRunner): Promise<string[]> {
  delete process.env.PAC_CLI_SPN_SECRET; // Will be cleaned up anyway by closing of the node process
  return pac("auth", "clear");
}

function addEnvironment(env: string) {
  return ["--environment", env];
}

function addCredentials(credentials: AuthCredentials) {
  if (isUsernamePassword(credentials)) {
    return addUsernamePassword(credentials);
  } else if (isFederatedCredentials(credentials)) {
    return addFederatedCredentials(credentials);
  } else {
    return addClientCredentials(credentials);
  }
}

function isUsernamePassword(credentials: AuthCredentials): credentials is UsernamePassword {
  return "username" in credentials;
}

function isFederatedCredentials(credentials: AuthCredentials): credentials is FederatedCredentials {
  return "federationProvider" in credentials;
}

function addFederatedCredentials(parameters: FederatedCredentials) {
  return [
    "--applicationId", parameters.appId,
    "--tenant", parameters.tenantId,
    parameters.federationProvider == "AzureDevOps" ? "--azureDevOpsFederated" : "--githubFederated",
  ];
}

function addClientCredentials(parameters: ClientCredentials) {

  if (parameters.scheme == "ManagedServiceIdentity"){
    return ["--managedIdentity"];
  }

  process.env.PAC_CLI_SPN_SECRET = parameters.clientSecret;
  const clientSecret = parameters.encodeSecret ? `data:text/plain;base64,${Buffer.from(parameters.clientSecret, 'binary').toString('base64')}` : parameters.clientSecret;

  return [
    "--tenant", parameters.tenantId,
    "--applicationId", parameters.appId,
    "--clientSecret", clientSecret];
}

function addUsernamePassword(parameters: UsernamePassword) {
  const password = parameters.encodePassword ? `data:text/plain;base64,${Buffer.from(parameters.password, 'binary').toString('base64')}` : parameters.password;

  return [
    "--username", parameters.username,
    "--password", password];
}

function addCloudInstance(parameters: AuthCredentials) {
  const cloudInstance = parameters.cloudInstance || 'Public';
  return [ "--cloud", cloudInstance ];
}
