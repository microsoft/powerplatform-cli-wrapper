import { PacRunner } from "../../cli/PacRunner";
import AuthenticationParameters from "./AuthenticationParameters";
import AuthenticationType from "./AuthenticationType";

export default async function authenticateAdmin(
  pac: PacRunner,
  parameters: AuthenticationParameters
): Promise<void> {
  const authenticationType = parameters.getAuthenticationType();
  switch (authenticationType) {
    case AuthenticationType.ClientCredentials:
      await pac.authenticateAdminWithClientCredentials(
        parameters.getClientCredentials()
      );
      break;
    case AuthenticationType.UsernamePassword:
      await pac.authenticateAdminWithUsernamePassword(
        parameters.getUsernamePassword()
      );
      break;
    default:
      throw new Error(`Unsupported authentication type: ${authenticationType}`);
  }
}
