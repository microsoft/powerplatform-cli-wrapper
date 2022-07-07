import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { authenticateAdmin, authenticateEnvironment } from "../../../src/pac/auth/authenticate";
import { CommandRunner } from "../../../src/CommandRunner";
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("auth", () => {
    const spnCreds = {
      appId: "APP_ID",
      clientSecret: "CLIENT_SECRET",
      tenantId: "TENANT_ID",
      cloudInstance: ""   // should be resolved to its default: Public
    };
    const userCreds = {
      username: "USERNAME",
      password: "PASSWORD",
      cloudInstance: "UsGov",
    };

    describe("kind#admin", () => {
      let pac: CommandRunner;
      beforeEach(() => {
        pac = stub();
      });
      afterEach(() => {
        delete process.env.PAC_CLI_SPN_SECRET;
        restore();
      });

      it("uses SPN authentication when provided client credentials", () => {
        authenticateAdmin(pac, spnCreds);

        process.env.should.have.property("PAC_CLI_SPN_SECRET", "CLIENT_SECRET");

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--kind",
          "ADMIN",
          "--tenant",
          spnCreds.tenantId,
          "--applicationId",
          spnCreds.appId,
          "--clientSecret",
          spnCreds.clientSecret,
          "--cloud",
          "Public"
        );
      });

      it("uses basic authentication when provided username / password", () => {
        authenticateAdmin(pac, userCreds);

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--kind",
          "ADMIN",
          "--username",
          userCreds.username,
          "--password",
          userCreds.password,
          "--cloud",
          userCreds.cloudInstance
        );
      });
    });

    describe("kind#Dataverse", () => {
      const envUrl = "https://ppdevtools.crm.dynamics.com";
      let pac: CommandRunner;
      beforeEach(() => {
        pac = stub();
      });
      afterEach(() => {
        delete process.env.PAC_CLI_SPN_SECRET;
        restore();
      });

      it("uses SPN authentication when provided client credentials", () => {
        authenticateEnvironment(pac, spnCreds, envUrl);

        process.env.should.have.property("PAC_CLI_SPN_SECRET", "CLIENT_SECRET");

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--url",
          envUrl,
          "--tenant",
          spnCreds.tenantId,
          "--applicationId",
          spnCreds.appId,
          "--clientSecret",
          spnCreds.clientSecret,
          "--cloud",
          "Public"
        );
      });

      it("uses basic authentication when provided username / password", () => {
        authenticateEnvironment(pac, userCreds, envUrl);

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--url",
          envUrl,
          "--username",
          userCreds.username,
          "--password",
          userCreds.password,
          "--cloud",
          userCreds.cloudInstance
        );
      });
    });
  });
});
