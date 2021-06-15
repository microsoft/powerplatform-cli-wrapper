import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { stub } from "sinon";
import { stubInterface } from "ts-sinon";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Logger } from "src";
import { Readable } from "stream";
should();
use(sinonChai);
use(chaiAsPromised);

describe("CommandRunner", () => {
  it("passes additional options to spawn", async () => {
    const spawnStub = stub();
    const processStub = stubInterface<ChildProcessWithoutNullStreams>();
    const stream = stubInterface<Readable>();
    processStub.stdout = stream;
    processStub.stderr = stream;
    spawnStub.returns(processStub);

    await rewiremock.around(
      async () => {
        const { createCommandRunner } = await import("../src/CommandRunner");
        const runCommand = createCommandRunner(
          "cwd",
          "command",
          stubInterface<Logger>(),
          {
            shell: true,
          }
        );
        runCommand();
      },
      (mock) => {
        mock(() => import("child_process")).with({
          spawn: spawnStub,
        });
      }
    );

    spawnStub.getCall(0).lastArg.should.have.deep.property("shell", true);
  });
});
