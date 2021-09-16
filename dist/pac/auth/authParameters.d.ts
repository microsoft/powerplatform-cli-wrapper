export interface ClientCredentials {
    appId: string;
    clientSecret: string;
    tenantId: string;
}
export interface UsernamePassword {
    username: string;
    password: string;
}
export declare type AuthCredentials = UsernamePassword | ClientCredentials;
