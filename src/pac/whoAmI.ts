import { CommandRunner } from "../CommandRunner";

export default function whoAmI(pac: CommandRunner): Promise<string[]> {
  return pac("org", "who");
}
