import ClientCredentials from "./ClientCredentials";
import UsernamePassword from "./UsernamePassword";

export default interface CredentialsParameters {
  credentials: UsernamePassword | ClientCredentials;
}
