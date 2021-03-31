import AuthenticationType from "./AuthenticationType";
import ClientCredentials from "../../ClientCredentials";
import Environment from "../../Environment";
import UsernamePassword from "../../UsernamePassword";

export default interface EnvironmentParameters {
  getAuthenticationType: () => AuthenticationType;
  getUsernamePassword: () => UsernamePassword;
  getClientCredentials: () => ClientCredentials;
  getEnvironment: () => Environment;
}
