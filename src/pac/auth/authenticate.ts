import { CommandRunner } from "../../CommandRunner";
import { ClientCredentials, AuthCredentials, UsernamePassword } from "./authParameters";

export function authenticateAdmin(pac: CommandRunner, credentials: AuthCredentials): Promise<string[]>
{
  return pac("auth", "create", "--kind", "ADMIN", ...addCredentials(credentials));
}

export function authenticateEnvironment(pac: CommandRunner, credentials: AuthCredentials, environmentUrl: string): Promise<string[]>
{
  return pac("auth", "create", ...addUrl(environmentUrl), ...addCredentials(credentials));
}

function addUrl(url: string)
{
  return ["--url", url];
}

function addCredentials(credentials: AuthCredentials)
{
  return isUsernamePassword(credentials) ? addUsernamePassword(credentials) : addClientCredentials(credentials);
}

function isUsernamePassword(credentials: AuthCredentials): credentials is UsernamePassword
{
  return "username" in credentials;
}

function addClientCredentials(parameters: ClientCredentials)
{
  return ["--tenant", parameters.tenantId, "--applicationId", parameters.appId, "--clientSecret", parameters.clientSecret];
}

function addUsernamePassword(parameters: UsernamePassword) 
{
  return ["--username", parameters.username, "--password", parameters.password];
}
