import AuthenticationType from "../AuthenticationType";
import { PacRunner } from "../cli/PacRunner";
import DevOpsOptions from "./DevOpsOptions";

export default async function authenticateAdmin(
  pac: PacRunner,
  options: DevOpsOptions
): Promise<void> {
  const authenticationType = options.getAuthenticationType();
  switch (authenticationType) {
    case AuthenticationType.ClientCredentials:
      await pac.authenticateAdminWithClientCredentials(
        options.getClientCredentials()
      );
      break;
    case AuthenticationType.UsernamePassword:
      await pac.authenticateAdminWithUsernamePassword(
        options.getUsernamePassword()
      );
      break;
    default:
      throw new Error(`Unsupported authentication type: ${authenticationType}`);
  }
}
