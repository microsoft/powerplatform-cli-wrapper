import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { ClientCredentials, RunnerParameters } from "../../src";
import { ExportSolutionParameters } from "../../src/actions";
import { CommandRunner } from "../../src/CommandRunner";
import { createDefaultMockRunnerParameters, createMockClientCredentials, testEnvironmentUrl } from "./sharedTestUtilities";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: exportSolution", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials : ClientCredentials = createMockClientCredentials();
  const environmentUrl : string = testEnvironmentUrl;
  let exportSolutionParameters: ExportSolutionParameters;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
    exportSolutionParameters = createMinMockExportSolutionParameters();
  });
  afterEach(() => restore());

  function rewireMock(exportSolutionParameters: ExportSolutionParameters) : Promise<Promise<void>>
  {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    return rewiremock.around(
      async () => 
      {
        const exportSolution = (await import("../../src/actions/exportSolution")).exportSolution;
        exportSolution(exportSolutionParameters, runnerParameters);
      },
      (mock) => 
      {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({authenticateEnvironment: authenticateEnvironmentStub});
      }
    );
  }

  function createMinMockExportSolutionParameters() : ExportSolutionParameters
  {
    return {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl,
      name: "Contoso",
      path: "C:\\Test\\ContosoSolution.zip"
    };
  }

  it("with minimal inputs, calls pac runner with correct arguments", 
      async () => 
      {
        await rewireMock(exportSolutionParameters);

        authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
        pacStub.should.have.been.calledOnceWith( "solution", "export", "--name", "Contoso", "--path", "C:\\Test\\ContosoSolution.zip");
      }
    );
});
