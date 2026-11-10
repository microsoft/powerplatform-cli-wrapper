import * as fs from "fs";
import * as path from "path";

/**
 * Absolute paths of every file under `folder`, recursively. Matches the glob.sync call it
 * replaced in checkSolution: names starting with '.' are skipped, symlinked folders are listed
 * but not followed, and a folder that is missing or cannot be read yields no entries.
 */
export function listFiles(folder: string): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(folder, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
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
