import CdsEnvironment from "../CdsEnvironment";
import ClientCredentials from "../ClientCredentials";
import Logger from "../Logger";
import UsernamePassword from "../UsernamePassword";
import AuthenticationType from "../AuthenticationType";

export default interface DevOpsOptions {
  getWorkingDir: () => string;
  getPacCliPath: () => string;
  getSopaPath: () => string;
  getAuthenticationType: () => AuthenticationType;
  getUsernamePassword: () => UsernamePassword;
  getCdsEnvironment: () => CdsEnvironment;
  getClientCredentials: () => ClientCredentials;
  logger: Logger;
}
