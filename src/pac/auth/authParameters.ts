export interface ClientCredentials
{
  appId: string;
  clientSecret: string;
  tenantId: string;
}

export interface UsernamePassword
{
  username: string;
  password: string;
}

export type AuthCredentials = UsernamePassword | ClientCredentials;

