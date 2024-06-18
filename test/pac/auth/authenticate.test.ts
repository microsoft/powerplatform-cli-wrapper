import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { authenticateAdmin, authenticateEnvironment } from "../../../src/pac/auth/authenticate";
import { CommandRunner } from "../../../src/CommandRunner";
import testLogger, {} from "../../testLogger";

should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("auth", () => {
    const spnCreds = {
      appId: "APP_ID",
      clientSecret: "CLIENT_SECRET",
      tenantId: "TENANT_ID",
      cloudInstance: "",   // should be resolved to its default: Public
      scheme: ""
    };
    const spnCredsEncoded = {
      appId: "APP_ID",
      clientSecret: "CLIENT_SECRET",
      encodeSecret: true,
      tenantId: "TENANT_ID",
      cloudInstance: "",   // should be resolved to its default: Public,
      scheme: ""
    };
    const userCreds = {
      username: "USERNAME",
      password: "PASSWORD",
      cloudInstance: "UsGov"
    };
    const userCredsEncoded = {
      username: "USERNAME",
      password: "PASSWORD",
      encodePassword: true,
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
        authenticateAdmin(pac, spnCreds, testLogger);

        process.env.should.have.property("PAC_CLI_SPN_SECRET", "CLIENT_SECRET");

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
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

      it("uses SPN authentication when provided encoded client credentials", () => {
        authenticateAdmin(pac, spnCredsEncoded, testLogger);

        process.env.should.have.property("PAC_CLI_SPN_SECRET", "CLIENT_SECRET");

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--tenant",
          spnCreds.tenantId,
          "--applicationId",
          spnCreds.appId,
          "--clientSecret",
          "data:text/plain;base64,Q0xJRU5UX1NFQ1JFVA==", // Base64 CLIENT_SECRET
          "--cloud",
          "Public"
        );
      });

      it("uses basic authentication when provided username / password", () => {
        authenticateAdmin(pac, userCreds, testLogger);

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--username",
          userCreds.username,
          "--password",
          userCreds.password,
          "--cloud",
          userCreds.cloudInstance
        );
      });

      it("uses basic authentication when provided encoded username / password", () => {
        authenticateAdmin(pac, userCredsEncoded, testLogger);

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--username",
          userCreds.username,
          "--password",
          "data:text/plain;base64,UEFTU1dPUkQ=", // Base64 PASSWORD
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
        authenticateEnvironment(pac, spnCreds, envUrl, testLogger);

        process.env.should.have.property("PAC_CLI_SPN_SECRET", "CLIENT_SECRET");

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--environment",
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
        authenticateEnvironment(pac, userCreds, envUrl, testLogger);

        pac.should.have.been.calledOnceWith(
          "auth",
          "create",
          "--environment",
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
