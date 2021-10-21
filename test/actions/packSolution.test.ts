/* eslint-disable @typescript-eslint/no-explicit-any */
import { should, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { restore, stub } from "sinon";
import * as sinonChai from "sinon-chai";
import { ClientCredentials, RunnerParameters } from "../../src";
import { PackSolutionParameters } from "../../src/actions";
import rewiremock from "../rewiremock";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import Sinon = require("sinon");
import { IHostAbstractions } from "../../src/host/IHostAbstractions";
import { platform } from "os";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: pack solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const zip = "./ContosoSolution.zip";
  const mockHost: IHostAbstractions = {
    name: "host",
    getInput: () => zip,
  }
  const folder = "./folder";
  const absoluteSolutionPath = (platform() === "win32") ? 'D:\\Test\\working\\ContosoSolution.zip' : '/Test/working/ContosoSolution.zip';
  const absoluteFolderPath = (platform() === "win32") ? 'D:\\Test\\working\\folder' : '/Test/working/folder';
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
  });
  afterEach(() => restore());

  async function runActionWithMocks(packSolutionParameters: PackSolutionParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/packSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });
    const stubFnc = Sinon.stub(mockHost, "getInput");
    stubFnc.onCall(0).returns(zip);
    stubFnc.onCall(1).returns(folder);

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.packSolution(packSolutionParameters, runnerParameters, mockHost);
  }

  it("calls pac runner with correct arguments", async () => {
    const packSolutionParameters: PackSolutionParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl,
      solutionZipFile: { name: 'SolutionInputFile', required: true },
      sourceFolder: { name: 'SolutionTargetFolder', required: true },
      solutionType: { name: 'SolutionType', required: false, defaultValue: "Unmanaged" },
    };

    await runActionWithMocks(packSolutionParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("solution", "pack", "--zipFile", absoluteSolutionPath, "--folder", absoluteFolderPath,
      "--packageType", "Unmanaged");
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });
});
