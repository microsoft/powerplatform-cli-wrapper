import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import { DownloadPaportalParameters } from "src/actions/downloadPaportal";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: download paportal", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  const path = "C:\\portals";
  const websiteId = "f88b70cc-580b-4f1a-87c3-41debefeb902";
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => path,
  }
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let downloadPaportalParameters: DownloadPaportalParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    downloadPaportalParameters = createDownloadPaportalParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(downloadPaportalParameters: DownloadPaportalParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/downloadPaportal"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });
    const stubFnc = Sinon.stub(mockHost, "getInput");
    stubFnc.onCall(0).returns(path);
    stubFnc.onCall(1).returns(websiteId);
    await mockedActionModule.downloadPaportal(downloadPaportalParameters, runnerParameters, mockHost);
  }

  const createDownloadPaportalParameters = (): DownloadPaportalParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    path: { name: "DownloadPath", required: true },
    websiteId: { name: "WebsiteId", required: true },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(downloadPaportalParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("paportal", "download", "--path", path, "--websiteId", websiteId);
  });
});
