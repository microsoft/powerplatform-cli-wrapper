import Environment from "../Environment";
import ClientCredentials from "../ClientCredentials";
import Logger from "../Logger";
import UsernamePassword from "../UsernamePassword";
import AuthenticationType from "../AuthenticationType";

export default interface DevOpsOptions {
  getWorkingDir: () => string;
  getRunnersDir: () => string;
  getAuthenticationType: () => AuthenticationType;
  getUsernamePassword: () => UsernamePassword;
  getEnvironment: () => Environment;
  getClientCredentials: () => ClientCredentials;
  logger: Logger;
}
