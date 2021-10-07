/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ResetEnvironmentParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: resetEnvironment", () => {
  let pacStub: CommandRunner;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const sourceEnvironmentUrl: string = mockEnvironmentUrl;
  let resetEnvironmentParameters: ResetEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    resetEnvironmentParameters = createMinMockResetEnvironmentParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(resetEnvironmentParameters: ResetEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/resetEnvironment"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    await mockedActionModule.resetEnvironment(resetEnvironmentParameters, runnerParameters, host);
  }

  const createMinMockResetEnvironmentParameters = (): ResetEnvironmentParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: sourceEnvironmentUrl,
    language: { name: "Language", required: true },
    overrideFriendlyName: { name: "OverrideFriendlyName", required: false },
    overrideDomainName: { name: "OverrideDomainName", required: false }
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(resetEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "reset", "--url", sourceEnvironmentUrl, "--language", host.language);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all optional inputs, calls pac runner with correct arguments", async () => {
    resetEnvironmentParameters.overrideFriendlyName = { name: "OverrideFriendlyName", required: true };
    resetEnvironmentParameters.friendlyEnvironmentName = { name: "FriendlyName", required: true };
    resetEnvironmentParameters.overrideDomainName = { name: "OverrideDomainName", required: true };
    resetEnvironmentParameters.domainName = { name: "DomainName", required: true };

    await runActionWithMocks(resetEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "reset", "--url", sourceEnvironmentUrl, "--language", host.language,
      "--domain", host.domainName, "--name", host.friendlyName);
  });
});
