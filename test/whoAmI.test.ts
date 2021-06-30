import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { fake, restore, stub } from "sinon";
import { CommandRunner } from "../src/CommandRunner";
import { WhoAmIParameters , RunnerParameters, Logger } from "../src";
import { stubInterface } from "ts-sinon";
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("org pacStub", () => {
    let pac: CommandRunner;
    beforeEach(() => {
      pac = stub();
    });
    afterEach(() => restore());

    it("uses correct export parameters for whoami", 
      async () => 
      {
        const logger = stubInterface<Logger>();

        const parameters: WhoAmIParameters = 
        {
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
        };

        const runnerParameters: RunnerParameters = 
        {
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: logger,
        }


        await rewiremock.around(
          async () => 
          {
            const whoAmI = (await import("../src/actions/whoAmI")).whoAmI;
            whoAmI(parameters, runnerParameters);
          },
          (mock) => 
          {
            mock(() => import("../src/pac/createPacRunner")).withDefault(() => pac);
            mock(() => import("../src/pac/auth/authenticate")).with({authenticateEnvironment: fake()});
          }
        );

        pac.should.have.been.calledOnceWith("org", "who");
      });
  });
});
