import * as fs from "fs";
import * as path from "path";

/**
 * Absolute paths of every file under `folder`, recursively; an empty list if it does not exist.
 * Matches the glob.sync call it replaced in checkSolution: names starting with '.' are skipped,
 * as glob does by default, and symlinked folders are listed but not followed.
 */
export function listFiles(folder: string): string[] {
  if (!fs.existsSync(folder)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
