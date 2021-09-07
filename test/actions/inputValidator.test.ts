import { IHostAbstractions, HostParameterEntry } from "../../src/host/IHostAbstractions";
import { InputValidator } from "../../src/host/InputValidator"
import { assert } from "chai";
import { restore } from "sinon";

describe("input validator test", () => {
  let validator: InputValidator;
  let pacArgs: string[];
  const property = "--property";

  beforeEach(() => {
    pacArgs = [];
  });
  afterEach(() => restore());

  it("returns proper string value", async () => {
    const stringValue = "string value";
    const hostParameterEntry : HostParameterEntry = {
      name: "test",
      required: true,
    };
    const mockHost : IHostAbstractions = {
      name: "something",
      getInput: () => { throw new Error() },
      getInputValue: () => stringValue,
    }
    validator = new InputValidator(mockHost);
    assert.equal(validator.getRequiredInput(hostParameterEntry), stringValue);
    validator.pushInput(pacArgs, property, hostParameterEntry);
    assert.deepEqual(pacArgs, [property, stringValue]);
  });

  it("returns proper boolean value", async () => {
    const hostParameterEntry : HostParameterEntry = {
      name: "test",
      required: true,
    };
    const mockHost : IHostAbstractions = {
      name: "something",
      getInput: () => { throw new Error() },
      getInputValue: () => "true",
    }
    validator = new InputValidator(mockHost);
    assert.equal(validator.getBooleanInput(hostParameterEntry), true);
    validator.pushBoolInput(pacArgs, property, hostParameterEntry);
    assert.deepEqual(pacArgs, [property, "true"]);
  });

  
  it("returns proper integer value", async () => {
    const hostParameterEntry : HostParameterEntry = {
      name: "test",
      required: true,
    };
    const mockHost : IHostAbstractions = {
      name: "something",
      getInput: () => { throw new Error() },
      getInputValue: () => "5",
    }
    validator = new InputValidator(mockHost);
    assert.equal(validator.getRequiredInt(hostParameterEntry), 5);
    validator.pushIntInput(pacArgs, property, hostParameterEntry);
    assert.deepEqual(pacArgs, [property, "5"]);
  });

  it("do not add optional to pac args", async () => {
    const mockHost : IHostAbstractions = {
      name: "something",
      getInput: () => { throw new Error() },
      getInputValue: () => { throw new Error() },
    }
    validator = new InputValidator(mockHost);
    validator.pushInput(pacArgs, property);
    assert.deepEqual(pacArgs, []);
  });
});
