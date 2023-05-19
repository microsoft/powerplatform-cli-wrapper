import os = require("os");
/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { PipelineDeployParameters } from "../../src/actions";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mock/mockData";
import { mockHost } from "./mock/mockHost";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: pipelineDeploy", () => {
  let pacStub: Sinon.SinonStub<any[], any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const envUrl: string = mockEnvironmentUrl;
  let pipelineDeployParameters: PipelineDeployParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    pipelineDeployParameters = createMinMockParameters();
  });
  afterEach(() => restore());

  async function runActionWithMocks(pipelineDeployParameters: PipelineDeployParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/pipelineDeploy"),
      (mock : any) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with(
          {
            authenticateEnvironment: authenticateEnvironmentStub,
            clearAuthentication: clearAuthenticationStub
          });
      });

      authenticateEnvironmentStub.returns("Authentication successfully created.");
      clearAuthenticationStub.returns("Authentication profiles and token cache removed");
      pacStub.returns(["Exporting data..."]);
      await mockedActionModule.pipelineDeploy(pipelineDeployParameters, runnerParameters, host);
  }

  const createMinMockParameters = (): PipelineDeployParameters => ({
    credentials: mockClientCredentials,
    solutionName: { name: "SolutionName", required: true },
    stageId: { name: "StageId", required: true },
    deploymentEnvironment: { name: "DeploymentEnvironment", required: true },
    currentVersion: { name: "Version", required: true },
    newVersion: { name: "Version", required: true },
    waitForCompletion: { name: "WaitForCompletion", required: false },
    environmentUrl: envUrl
  });

  it("with minimal inputs, calls pac runner with correct arguments", async () => {
    if (os.platform() !== 'win32') {
      console.log(">> Skipping pipelineDeploy test, only supported on Windows");
      return;
    }
    await runActionWithMocks(pipelineDeployParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials);
    pacStub.should.have.been.calledOnceWith("pipeline", "deploy",
      "--solutionName", host.solutionName,
      "--stageId", host.stageId,
      "--environment", host.deploymentEnvironment,
      "--currentVersion", host.version,
      "--newVersion", host.version
      );
    clearAuthenticationStub.should.have.been.calledOnceWith(pacStub);
  });

});
