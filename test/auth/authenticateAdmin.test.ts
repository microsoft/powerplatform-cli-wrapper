import AuthenticationParameters from "../../src/devops/auth/AuthenticationParameters";
import { stubInterface } from "ts-sinon";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { AuthenticationType } from "../../src";
import { PacRunner } from "../../src/cli/PacRunner";
import authenticateAdmin from "../../src/devops/auth/authenticateAdmin";
import { should, use } from "chai";
import { restore } from "sinon";
should();
use(sinonChai);
use(chaiAsPromised);

describe("authenticateAdmin", () => {
  afterEach(restore);
  const parameters = stubInterface<AuthenticationParameters>();
  const pac = stubInterface<PacRunner>();

  it("uses ClientCredentials when authentication type is ClientCredentials", async () => {
    parameters.getAuthenticationType.returns(
      AuthenticationType.ClientCredentials
    );

    await authenticateAdmin(pac, parameters);

    pac.authenticateAdminWithClientCredentials.should.have.been.calledOnce;
  });

  it("uses UsernamePassword when authentication type is UsernamePassword", async () => {
    parameters.getAuthenticationType.returns(
      AuthenticationType.UsernamePassword
    );

    await authenticateAdmin(pac, parameters);

    pac.authenticateAdminWithUsernamePassword.should.have.been.calledOnce;
  });

  it("throws an error when provided an invalid authentication type", async () => {
    parameters.getAuthenticationType.returns(-1);

    await authenticateAdmin(pac, parameters).should.eventually.be.rejectedWith(
      Error,
      /^Unsupported authentication type/
    );
  });
});
