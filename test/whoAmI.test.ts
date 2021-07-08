import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { restore, stub } from "sinon";
import { CommandRunner } from "../src/CommandRunner";
import { ClientCredentials, RunnerParameters } from "../src";
import { getDefaultMockRunnerParameters, getMockClientCredentials, getTestEnvironmentUrl } from "./sharedTestUtilities";
import { WhoAmIParameters } from "../src/actions";
import Sinon = require("sinon");
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("org who", () => {
    let pacStub: CommandRunner;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let authenticateEnvironmentStub: Sinon.SinonStub<any[], any>;
    const mockClientCredentials : ClientCredentials = getMockClientCredentials();
    const environmentUrl : string = getTestEnvironmentUrl();
    const runnerParameters: RunnerParameters = getDefaultMockRunnerParameters();

    beforeEach(() => {
      pacStub = stub();
      authenticateEnvironmentStub = stub();
    });
    afterEach(() => restore());

    function rewireMock(whoAmIParameters: WhoAmIParameters, runnerParameters: RunnerParameters) : Promise<Promise<void>>
    {
      return rewiremock.around(
        async () => 
        {
          const whoAmI = (await import("../src/actions/whoAmI")).whoAmI;
          whoAmI(whoAmIParameters, runnerParameters);
        },
        (mock) => 
        {
          mock(() => import("../src/pac/createPacRunner")).withDefault(() => pacStub);
          mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: authenticateEnvironmentStub});
        }
      );
    }

    it("uses correct export parameters for whoami", 
      async () => 
      {
        const whoAmIParameters: WhoAmIParameters = 
        {
          credentials: mockClientCredentials,
          environmentUrl: environmentUrl
        };

        await rewireMock(whoAmIParameters, runnerParameters);

        authenticateEnvironmentStub.should.have.been.calledOnceWith(pacStub, mockClientCredentials, environmentUrl);
        pacStub.should.have.been.calledOnceWith("org", "who");
      });
  });
});
