import AuthenticationType from "./AuthenticationType";
import { PacRunner } from "../../cli/PacRunner";
import AuthenticationParameters from "./AuthenticationParameters";

export default async function authenticateCds(
  pac: PacRunner,
  parameters: AuthenticationParameters
): Promise<void> {
  const authenticationType = parameters.getAuthenticationType();
  switch (authenticationType) {
    case AuthenticationType.ClientCredentials:
      await pac.authenticateCdsWithClientCredentials({
        ...parameters.getEnvironment(),
        ...parameters.getClientCredentials(),
      });
      break;
    case AuthenticationType.UsernamePassword:
      await pac.authenticateCdsWithUsernamePassword({
        ...parameters.getEnvironment(),
        ...parameters.getUsernamePassword(),
      });
      break;
    default:
      throw new Error(`Unsupported authentication type: ${authenticationType}`);
  }
}
