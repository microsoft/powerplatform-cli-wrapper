import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { authenticateAdmin } from "../../../src/pac/auth/authenticate";
import { CommandRunner } from "../../../src/CommandRunner";
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("auth", () => {
    describe("authenticateAdmin", () => {
      let pac: CommandRunner;
      beforeEach(() => {
        pac = stub();
      });
      afterEach(() => restore());

      it("uses SPN authentication when provided client credentials", () => {
        authenticateAdmin(pac, {
          credentials: {
            appId: "APP_ID",
            clientSecret: "CLIENT_SECRET",
            tenantId: "TENANT_ID",
          },
        });
        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--kind",
          "ADMIN",
          "--tenant",
          "TENANT_ID",
          "--applicationId",
          "APP_ID",
          "--clientSecret",
          "CLIENT_SECRET"
        );
      });

      it("uses basic authentication when provided username / password", () => {
        authenticateAdmin(pac, {
          credentials: {
            username: "USERNAME",
            password: "PASSWORD",
          },
        });
        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--kind",
          "ADMIN",
          "--username",
          "USERNAME",
          "--password",
          "PASSWORD"
        );
      });
    });
  });
});
