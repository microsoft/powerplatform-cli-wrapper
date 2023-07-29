/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { expect, should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { RestoreEnvironmentParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: restoreEnvironment", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  let restoreEnvironmentParameters: RestoreEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    restoreEnvironmentParameters = {
      credentials: mockClientCredentials,
      sourceEnvironment: { name: "Environment", required: false },
      targetEnvironment: { name: "TargetEnvironment", required: false },
      sourceEnvironmentUrl: { name: "EnvironmentUrl", required: true },
      targetEnvironmentUrl: { name: "TargetEnvironmentUrl", required: true },
      sourceEnvironmentId: { name: "EnvironmentId", required: false },
      targetEnvironmentId: { name: "TargetEnvironmentId", required: false },
      restoreLatestBackup: { name: "RestoreLatestBackup", required: false },
      targetEnvironmentName: { name: "FriendlyName", required: false },
      logToConsole: false
    };
  });
  afterEach(() => restore());

  async function runActionWithMocks(restoreEnvironmentParameters: RestoreEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/restoreEnvironment"),
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
    await mockedActionModule.restoreEnvironment(restoreEnvironmentParameters, runnerParameters, host);
  }

  it("Throws valid error when Latest Backup isn't true and date and time for backup is undefined", async () => {
    await expect(runActionWithMocks(restoreEnvironmentParameters)).to.be.rejectedWith(
      "Either latest backup must be true or Valid date and time for backup must be provided."
    );
  });

  it("with required inputs set by host, calls pac runner stub with correct arguments", async () => {
    restoreEnvironmentParameters.restoreLatestBackup = { name: "RestoreLatestBackup", required: false, defaultValue: true };

    await runActionWithMocks(restoreEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "restore", "--source-url", host.environmentUrl, "--target-url", host.targetEnvironmentUrl,
      "--selected-backup", "latest");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    restoreEnvironmentParameters.restoreLatestBackup = { name: "RestoreLatestBackup", required: false, defaultValue: true };
    restoreEnvironmentParameters.targetEnvironmentName = { name: "FriendlyName", required: true };
    restoreEnvironmentParameters.sourceEnvironmentId = { name: "EnvironmentId", required: true };
    restoreEnvironmentParameters.targetEnvironmentId = { name: "TargetEnvironmentId", required: true };
    restoreEnvironmentParameters.sourceEnvironment = { name: "Environment", required: true };
    restoreEnvironmentParameters.targetEnvironment = { name: "TargetEnvironment", required: true };

    await runActionWithMocks(restoreEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "restore", "--source-env", host.environment, "--target-env", host.targetEnvironment,
      "--source-url", host.environmentUrl, "--target-url", host.targetEnvironmentUrl, "--source-id", host.environmentId, "--target-id", host.targetEnvironmentId,
      "--name", host.friendlyName, "--selected-backup", "latest");
  });

  it("With restore latest backup turned off and restore time stamp set, calls pac runner stub with correct arguments", async () => {
    restoreEnvironmentParameters.restoreLatestBackup = { name: "RestoreLatestBackup", required: false };
    restoreEnvironmentParameters.backupDateTime = { name: "RestoreTimeStamp", required: true };
    restoreEnvironmentParameters.targetEnvironmentName = { name: "FriendlyName", required: true };

    await runActionWithMocks(restoreEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "restore", "--source-url", host.environmentUrl, "--target-url", host.targetEnvironmentUrl,
      "--name", host.friendlyName, "--selected-backup", host.restoreTimeStamp);
  });
});
