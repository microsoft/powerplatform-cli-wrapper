import { IHostAbstractions, HostParameterEntry } from "../../src/host/IHostAbstractions";
import { InputValidator } from "../../src/host/InputValidator"
import { assert } from "chai";
import { restore } from "sinon";

describe("input validator test", () => {
  let validator: InputValidator;
  let pacArgs: string[];
  const property = "--property";
  const inputValue = "inputValue";
  const defaultValue = "defaultValue";
  const hostName = "name";
  const mockHostReturnUndefined : IHostAbstractions = {
    name: hostName,
    getInput: () => undefined,
  }
  const mockHostReturnInput : IHostAbstractions = {
    name: hostName,
    getInput: () => inputValue,
  }
  const hostParameterEntryRequired : HostParameterEntry = {
    name: hostName,
    required: true,
    defaultValue: defaultValue,
  };
  const hostParameterEntryOptional : HostParameterEntry = {
    name: hostName,
    required: false,
    defaultValue: defaultValue,
  };
  beforeEach(() => {
    pacArgs = [];
  });
  afterEach(() => restore());

  it("returns proper string value for a required set param", async () => {
    validator = new InputValidator(mockHostReturnInput);
    validator.pushInput(pacArgs, property, hostParameterEntryRequired);
    assert.deepEqual(pacArgs, [property, inputValue]);
  });

  it("throws error for a required param not set", async () => {
    const hostParameterEntryWithNoDefault : HostParameterEntry = {
      name: "test",
      required: true,
    };
    validator = new InputValidator(mockHostReturnUndefined);
    assert.throw(() => validator.pushInput(pacArgs, property, hostParameterEntryWithNoDefault));
  });

  it("returns default string value for a required param not set", async () => {
    validator = new InputValidator(mockHostReturnUndefined);
    validator.pushInput(pacArgs, property, hostParameterEntryRequired);
    assert.deepEqual(pacArgs, [property, defaultValue]);
  });

  it("pushes optionally set param", async () => {
    validator = new InputValidator(mockHostReturnInput);
    assert.equal(validator.getInput(hostParameterEntryOptional), inputValue);
    validator.pushInput(pacArgs, property, hostParameterEntryOptional);
    assert.deepEqual(pacArgs, [property, inputValue]);
  });

  it("pushes default of optionally param not set", async () => {
    validator = new InputValidator(mockHostReturnUndefined);
    validator.pushInput(pacArgs, property, hostParameterEntryOptional);
    assert.deepEqual(pacArgs, [property, defaultValue]);
  });

  it("do not add optional to pac args", async () => {
    validator = new InputValidator(mockHostReturnUndefined);
    validator.pushInput(pacArgs, property);
    assert.deepEqual(pacArgs, []);
  });
});
