import rewiremock from "./rewiremock";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import { should, use } from "chai";
import { stub } from "sinon";
import { stubInterface } from "ts-sinon";
import { Logger } from "src/Parameters";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Readable } from "stream";
should();
use(sinonChai);
use(chaiAsPromised);

describe("CommandRunner", () => {
  it("passes additional options and env variables to spawn", async () => {
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
          },
          "myAgent"
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
    const options = spawnStub.getCall(0).args[2];
    options.should.be.an('object');
    options.should.have.deep.property('env');
    const env = options.env;
    env.should.have.property('PATH');
    env.should.have.property('PP_TOOLS_AUTOMATION_AGENT', 'myAgent');
    // assert we have a full copy of process.env:
    Object.keys(env).length.should.be.above(10);
  });
});
