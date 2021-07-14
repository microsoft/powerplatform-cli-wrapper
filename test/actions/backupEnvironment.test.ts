import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { BackupEnvironmentParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mockData";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: backupEnvironment", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;
  const backupLabel = "mock label";
  let backupEnvironmentParameters: BackupEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    backupEnvironmentParameters = createMinMockBackupEnvironmentParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(deleteEnvironmentParameters: BackupEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/backupEnvironment"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateAdmin: authenticateAdminStub });
      });

    await mockedActionModule.backupEnvironment(deleteEnvironmentParameters, runnerParameters);
  }

  const createMinMockBackupEnvironmentParameters = (): BackupEnvironmentParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: environmentUrl,
    backupLabel: backupLabel
  });

  it("calls pac runner with correct arguments", async () => {
    backupEnvironmentParameters.notes = "mock notes";
    await runActionWithMocks(backupEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "backup", "--url", environmentUrl, "--label", backupLabel, "--notes", "mock notes");
  });
});
