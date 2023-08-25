/* eslint-disable @typescript-eslint/no-explicit-any */
import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters } from "./mock/mockData";
import { UpdateVersionSolutionParameters } from "../../src/actions/updateVersionSolution";
import Sinon = require("sinon");
import { mockHost } from "./mock/mockHost";
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: updateVersion solution", () => {
  let pacStub: Sinon.SinonStub<any[],any>;
  let authenticateEnvironmentStub: Sinon.SinonStub<any[],any>;
  let clearAuthenticationStub: Sinon.SinonStub<any[], any>;
  const host = new mockHost();
  let updateVersionSolutionParameters: UpdateVersionSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    clearAuthenticationStub = stub();
    updateVersionSolutionParameters = createUpdateVersionSolutionParameters();
  })
  afterEach(() => restore())

  async function runActionWithMocks(updateVersionSolutionParameters: UpdateVersionSolutionParameters) {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();
    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/updateVersionSolution"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
      });

    authenticateEnvironmentStub.returns("Authentication successfully created.");
    clearAuthenticationStub.returns("Authentication profiles and token cache removed");
    pacStub.returns("");
    await mockedActionModule.updateVersionSolution(updateVersionSolutionParameters, runnerParameters, host);
  }

  const createUpdateVersionSolutionParameters = (): UpdateVersionSolutionParameters => ({
    buildVersion: { name: 'BuildVersion', required: true },
    strategy: { name: 'Strategy', required: false },
    fileName: { name: 'FileName', required: false },
    logToConsole: false
  });

  it("with required params, calls pac runner with correct args", async () => {
    await runActionWithMocks(updateVersionSolutionParameters);

    pacStub.should.have.been.calledOnceWith("solution", "version", "--buildversion", host.buildVersion);
  });
});
