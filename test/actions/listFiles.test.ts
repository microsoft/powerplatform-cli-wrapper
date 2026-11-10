import { should } from "chai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { listFiles } from "../../src/actions/listFiles";

should();

describe("listFiles", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "listfiles-"));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("returns an empty list when the folder does not exist", () => {
    listFiles(path.join(root, "missing")).should.deep.equal([]);
  });

  it("returns absolute paths of nested files, without folders or dot entries", () => {
    fs.mkdirSync(path.join(root, "a", "b"), { recursive: true });
    fs.mkdirSync(path.join(root, ".hidden"));
    fs.mkdirSync(path.join(root, "empty"));
    fs.writeFileSync(path.join(root, "top.sarif"), "");
    fs.writeFileSync(path.join(root, "a", "b", "nested.zip"), "");
    fs.writeFileSync(path.join(root, ".dotfile"), "");
    fs.writeFileSync(path.join(root, ".hidden", "inside.txt"), "");

    listFiles(root).sort().should.deep.equal([
      path.join(root, "a", "b", "nested.zip"),
      path.join(root, "top.sarif"),
    ].sort());
  });
});
