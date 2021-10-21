/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CopyEnvironmentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: copyEnvironment", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const sourceEnvironmentUrl: string = mockEnvironmentUrl;
  let copyEnvironmentParameters: CopyEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    copyEnvironmentParameters = createMinMockCopyEnvironmentParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(copyEnvironmentParameters: CopyEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/copyEnvironment"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateAdmin: authenticateAdminStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

    authenticateAdminStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.copyEnvironment(copyEnvironmentParameters, runnerParameters, host);
  }

  const createMinMockCopyEnvironmentParameters = (): CopyEnvironmentParameters => ({
    credentials: mockClientCredentials,
    sourceEnvironmentUrl: sourceEnvironmentUrl,
    targetEnvironmentUrl: { name: "TargetEnvironmentUrl", required: true },
    overrideFriendlyName: { name: "OverrideFriendlyName", required: false },
    copyType: { name: "CopyType", required: false }
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(copyEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "copy", "--source-url", sourceEnvironmentUrl, "--target-url", host.targetEnvironmentUrl);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all optional inputs, calls pac runner with correct arguments", async () => {
    copyEnvironmentParameters.overrideFriendlyName = { name: "OverrideFriendlyName", required: true };
    copyEnvironmentParameters.friendlyTargetEnvironmentName = { name: "FriendlyName", required: true };
    copyEnvironmentParameters.copyType = { name: "CopyType", required: true };

    await runActionWithMocks(copyEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "copy", "--source-url", sourceEnvironmentUrl, "--target-url", host.targetEnvironmentUrl,
      "--name", host.friendlyName, "--type", host.copyType);
  });
});
