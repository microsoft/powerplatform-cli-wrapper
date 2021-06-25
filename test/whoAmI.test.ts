import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { fake, restore, stub } from "sinon";
import { Logger } from "../src/Parameters";
import { CommandRunner } from "../src/CommandRunner";
import { WhoAmIParameters } from "../src/actions/whoAmI";
import { stubInterface } from "ts-sinon";
should();
use(sinonChai);
use(chaiAsPromised);

describe("pac", () => {
  describe("org", () => {
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
          runnersDir: "C:\\Test\\",
          workingDir: "C:\\Test\\",
          logger: logger,
          credentials: {appId: "APP_ID", clientSecret: "CLIENT_SECRET", tenantId: "TENANT_ID"},
          environmentUrl: "https://contoso.crm.dynamics.com/",
        };

        await rewiremock.around(
          async () => 
          {
            const whoAmI = (await import("../src/actions/whoAmI")).whoAmI;
            whoAmI(parameters);
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
