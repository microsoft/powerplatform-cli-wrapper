/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { expect, should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { RestoreEnvironmentParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: restoreEnvironment", () => {
  let pacStub: CommandRunner;
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  let restoreEnvironmentParameters: RestoreEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    clearAuthenticationStub = stub();
    restoreEnvironmentParameters = {
      credentials: mockClientCredentials,
      sourceEnvironmentUrl: environmentUrl,
      targetEnvironmentUrl: { name: "TargetEnvironmentUrl", required: true },
      restoreLatestBackup: { name: "RestoreLatestBackup", required: false },
      targetEnvironmentName: { name: "FriendlyName", required: false },
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
    pacStub.should.have.been.calledOnceWith("admin", "restore", "--source-url", environmentUrl, "--target-url", host.targetEnvironmentUrl,
      "--selected-backup", "latest");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

  it("with all inputs set by host, calls pac runner stub with correct arguments", async () => {
    restoreEnvironmentParameters.restoreLatestBackup = { name: "RestoreLatestBackup", required: false, defaultValue: true };
    restoreEnvironmentParameters.targetEnvironmentName = { name: "FriendlyName", required: true };

    await runActionWithMocks(restoreEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "restore", "--source-url", environmentUrl, "--target-url", host.targetEnvironmentUrl,
      "--name", host.friendlyName, "--selected-backup", "latest");
  });

  it("With restore latest backup turned off and restore time stamp set, calls pac runner stub with correct arguments", async () => {
    restoreEnvironmentParameters.restoreLatestBackup = { name: "RestoreLatestBackup", required: false };
    restoreEnvironmentParameters.backupDateTime = { name: "RestoreTimeStamp", required: true };
    restoreEnvironmentParameters.targetEnvironmentName = { name: "FriendlyName", required: true };

    await runActionWithMocks(restoreEnvironmentParameters);

    pacStub.should.have.been.calledOnceWith("admin", "restore", "--source-url", environmentUrl, "--target-url", host.targetEnvironmentUrl,
      "--name", host.friendlyName, "--selected-backup", host.restoreTimeStamp);
  });
});
