import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join, parse } from "path";

export interface PacRuntimeEnvironment {
  /** Root directory used for this PAC request. */
  root: string;
  /** Environment overrides to pass to PAC child processes. */
  environment: NodeJS.ProcessEnv;
  /** Idempotently removes the request root after all PAC children have exited. */
  cleanup: () => Promise<void>;
}

/**
 * Creates a disposable PAC profile/cache boundary for one request.
 *
 * PAC does not document these profile-directory environment variables as a
 * public isolation API. Hosts should run an opt-in smoke test for their PAC
 * version and retain a serialized fallback when the variables are ignored.
 */
export async function createPacRuntimeEnvironment(prefix = "pac-cli-"): Promise<PacRuntimeEnvironment> {
  const root = await fs.mkdtemp(join(tmpdir(), prefix));
  const appData = join(root, "AppData", "Roaming");
  const localAppData = join(root, "AppData", "Local");
  const home = join(root, "home");
  const dotnetHome = join(root, "dotnet");
  const xdgConfig = join(root, "xdg", "config");
  const xdgData = join(root, "xdg", "data");
  const xdgCache = join(root, "xdg", "cache");

  const windowsRoot = parse(root).root.replace(/[\\/]$/, "");
  const windowsHome = root.slice(windowsRoot.length);
  const environment: NodeJS.ProcessEnv = {
    USERPROFILE: root,
    HOME: home,
    APPDATA: appData,
    LOCALAPPDATA: localAppData,
    HOMEDRIVE: windowsRoot,
    HOMEPATH: windowsHome,
    DOTNET_CLI_HOME: dotnetHome,
    XDG_CONFIG_HOME: xdgConfig,
    XDG_DATA_HOME: xdgData,
    XDG_CACHE_HOME: xdgCache,
  };

  let cleaned = false;
  return {
    root,
    environment,
    cleanup: async () => {
      if (cleaned) return;
      cleaned = true;
      await fs.rm(root, { recursive: true, force: true });
    },
  };
}

/**
 * Runs one request inside a disposable PAC runtime and always cleans it up.
 * The callback must await every PAC child process before it returns.
 */
export async function withPacRuntimeEnvironment<T>(
  operation: (runtime: PacRuntimeEnvironment) => Promise<T>,
  prefix = "pac-cli-"
): Promise<T> {
  const runtime = await createPacRuntimeEnvironment(prefix);
  try {
    return await operation(runtime);
  } finally {
    await runtime.cleanup();
  }
}
