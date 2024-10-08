/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CopyEnvironmentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: copyEnvironment", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
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
    pacStub.returns(["Creating Dataverse Environment with name mock in your tenant.",
        "Polling to check the status of your Environment... Execution time: 00:00:05.2471936",
        "Polling to check the status of your Environment... Execution time: 00:00:10.4768377",
        "Polling to check the status of your Environment... Execution time: 00:00:15.6820813",
        "Polling to check the status of your Environment... Execution time: 00:00:20.8943171",
        "Polling to check the status of your Environment... Execution time: 00:00:26.1020621",
        "Polling to check the status of your Environment... Execution time: 00:00:31.3363596",
        "Polling completed with status code : OK",
        "Environment Url Environment Id Friendly Name Domain Name Organization Id Version",
        "https://mocktest.crm.dynamics.com/ 0-0-0-0-0 mock sampletest 0-0-0-0 0.0.0.0"]);
    await mockedActionModule.copyEnvironment(copyEnvironmentParameters, runnerParameters, host);
  }

  const createMinMockCopyEnvironmentParameters = (): CopyEnvironmentParameters => ({
    credentials: mockClientCredentials,
    sourceEnvironmentUrl: { name: "EnvironmentUrl", required: true },
    targetEnvironmentUrl: { name: "TargetEnvironmentUrl", required: true },
    sourceEnvironmentId: { name: "EnvironmentId", required: false },
    targetEnvironmentId: { name: "TargetEnvironmentId", required: false },
    overrideFriendlyName: { name: "OverrideFriendlyName", required: false },
    copyType: { name: "CopyType", required: false },
    logToConsole: false
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(copyEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "copy", "--source-url", host.environmentUrl, "--target-url", host.targetEnvironmentUrl);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all optional inputs, calls pac runner with correct arguments", async () => {
    copyEnvironmentParameters.sourceEnvironment = { name: "Environment", required: true };
    copyEnvironmentParameters.targetEnvironment = { name: "TargetEnvironment", required: true };
    copyEnvironmentParameters.sourceEnvironmentId = { name: "EnvironmentId", required: true };
    copyEnvironmentParameters.targetEnvironmentId = { name: "TargetEnvironmentId", required: true };
    copyEnvironmentParameters.overrideFriendlyName = { name: "OverrideFriendlyName", required: true };
    copyEnvironmentParameters.friendlyTargetEnvironmentName = { name: "FriendlyName", required: true };
    copyEnvironmentParameters.copyType = { name: "CopyType", required: true };

    await runActionWithMocks(copyEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "copy", "--source-env", host.environment, "--target-env", host.targetEnvironment,
      "--source-url", host.environmentUrl, "--target-url", host.targetEnvironmentUrl, "--source-id", host.environmentId, "--target-id",
      host.targetEnvironmentId, "--name", host.friendlyName, "--type", host.copyType);
  });
});
