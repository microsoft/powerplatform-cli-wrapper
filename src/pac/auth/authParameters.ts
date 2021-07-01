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

export interface CredentialsParameters
{
  credentials: UsernamePassword | ClientCredentials;
}

export interface EnvironmentUrlParameters
{
  environmentUrl: string;
}

