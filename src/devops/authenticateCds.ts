import AuthenticationType from "../AuthenticationType";
import { PacRunner } from "../cli/PacRunner";
import DevOpsOptions from "./DevOpsOptions";

export default async function authenticateCds(
  pac: PacRunner,
  options: DevOpsOptions
): Promise<void> {
  const authenticationType = options.getAuthenticationType();
  switch (authenticationType) {
    case AuthenticationType.ClientCredentials:
      await pac.authenticateCdsWithClientCredentials({
        ...options.getEnvironment(),
        ...options.getClientCredentials(),
      });
      break;
    case AuthenticationType.UsernamePassword:
      await pac.authenticateCdsWithUsernamePassword({
        ...options.getEnvironment(),
        ...options.getUsernamePassword(),
      });
      break;
    default:
      throw new Error(`Unsupported authentication type: ${authenticationType}`);
  }
}
