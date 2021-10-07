/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import { UploadPaportalParameters } from "src/actions/uploadPaportal";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: upload paportal", () => {
  let pacStub: CommandRunner;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const path = "C:\\portals\\starter-portal";
  const mockHost : IHostAbstractions = {
    name: "host",
    getInput: () => path,
  }
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let uploadPaportalParameters: UploadPaportalParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    uploadPaportalParameters = createUploadPaportalParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(uploadPaportalParameters: UploadPaportalParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/uploadPaportal"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    await mockedActionModule.uploadPaportal(uploadPaportalParameters, runnerParameters, mockHost);
  }

  const createUploadPaportalParameters = (): UploadPaportalParameters => ({
    credentials: mockClientCredentials,
    environmentUrl: envUrl,
    path: { name: "uploadPath", required: true },
    deploymentProfile: { name: "DeploymentProfile", required: false },
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(uploadPaportalParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, envUrl);
    pacStub.should.have.been.calledOnceWith("paportal", "upload", "--path", path);
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
