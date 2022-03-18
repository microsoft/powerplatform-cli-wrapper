export interface ClientCredentials
{
  appId: string;
  clientSecret: string;
  tenantId: string;
  cloudInstance: string;
}

export interface UsernamePassword
{
  username: string;
  password: string;
  cloudInstance: string;
}

export type AuthCredentials = UsernamePassword | ClientCredentials;

