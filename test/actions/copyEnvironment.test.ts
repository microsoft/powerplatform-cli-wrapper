import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CopyEnvironmentParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mockData";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: copyEnvironment", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateAdminStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const sourceEnvironmentUrl: string = mockEnvironmentUrl;
  const targetEnvironmentUrl = "https://contoso2.crm.dynamics.com/";
  let copyEnvironmentParameters: CopyEnvironmentParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateAdminStub = stub();
    copyEnvironmentParameters = createMinMockCopyEnvironmentParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(copyEnvironmentParameters: CopyEnvironmentParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/copyEnvironment"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateAdmin: authenticateAdminStub });
      });

    await mockedActionModule.copyEnvironment(copyEnvironmentParameters, runnerParameters);
  }

  const createMinMockCopyEnvironmentParameters = (): CopyEnvironmentParameters => ({
    adminCredentials: mockClientCredentials,
    sourceEnvironmentUrl: sourceEnvironmentUrl,
    targetEnvironmentUrl: targetEnvironmentUrl,
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    await runActionWithMocks(copyEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "copy", "--source-url", sourceEnvironmentUrl, "--target-url", targetEnvironmentUrl);
  });

  it("with all optional inputs, calls pac runner with correct arguments", async () => {
    copyEnvironmentParameters.async = true;
    copyEnvironmentParameters.targetEnvironmentName = "Target Environment";
    copyEnvironmentParameters.copyType = "FullCopy";

    await runActionWithMocks(copyEnvironmentParameters);

    authenticateAdminStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("admin", "copy", "--source-url", sourceEnvironmentUrl, "--target-url", targetEnvironmentUrl,
      "--name", "Target Environment", "--type", "FullCopy", "--async");
  });
});
