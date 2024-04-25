export interface ClientCredentials
{
  appId: string;
  clientSecret: string;
  encodeSecret?: boolean;
  tenantId: string;
  cloudInstance: string;
  scheme: string;
}

export interface FederatedCredentials
{
  appId: string;
  tenantId: string;
  cloudInstance: string;
  scheme: string;
  federationProvider : "AzureDevOps" | "GitHub";
}

export interface UsernamePassword
{
  username: string;
  password: string;
  encodePassword?: boolean;
  cloudInstance: string;
}

export type AuthCredentials = UsernamePassword | ClientCredentials | FederatedCredentials;

