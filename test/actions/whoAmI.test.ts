import rewiremock from "../rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { CommandRunner } from "../../src/CommandRunner";
import { ClientCredentials, RunnerParameters } from "../../src";
import { createDefaultMockRunnerParameters, createMockClientCredentials, mockEnvironmentUrl } from "./mockData";
import { WhoAmIParameters } from "../../src/actions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("action: whoAmI", () => {
  let pacStub: CommandRunner;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
  const mockClientCredentials: ClientCredentials = createMockClientCredentials();
  const environmentUrl: string = mockEnvironmentUrl;

  beforeEach(() => {
    pacStub = stub();
    authenticateEnvironmentStub = stub();
  });
  afterEach(() => restore());

  async function runActionWithMocks(whoAmIParameters: WhoAmIParameters): Promise<void> {
    const runnerParameters: RunnerParameters = createDefaultMockRunnerParameters();

    const mockedActionModule = await rewiremock.around(() => import("../../src/actions/whoAmI"),
      (mock) => {
        mock(() => import("../../src/pac/createPacRunner")).withDefault(() => pacStub);
        mock(() => import("../../src/pac/auth/authenticate")).with({ authenticateEnvironment: authenticateEnvironmentStub });
      });

    await mockedActionModule.whoAmI(whoAmIParameters, runnerParameters);
  }

  it("calls pac runner with correct arguments", async () => {
    const whoAmIParameters: WhoAmIParameters = {
      credentials: mockClientCredentials,
      environmentUrl: environmentUrl
    };

    await runActionWithMocks(whoAmIParameters);

    authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
    pacStub.should.have.been.calledOnceWith("org", "who");
  });
});
