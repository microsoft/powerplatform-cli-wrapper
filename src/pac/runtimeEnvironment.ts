import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join, parse } from "path";
import type { RunnerParameters } from "../Parameters";

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
  if (!/^[a-zA-Z0-9_-]+$/.test(prefix)) {
    throw new Error("PAC runtime prefix may contain only letters, numbers, underscores, and hyphens");
  }

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

  let cleanupPromise: Promise<void> | undefined;
  return {
    root,
    environment,
    cleanup: async () => {
      cleanupPromise ??= fs.rm(root, {
        recursive: true,
        force: true,
        // Older PAC builds can leave telemetry-created directories behind
        // briefly after the main process exits.
        maxRetries: 30,
        retryDelay: 500,
      });
      await cleanupPromise;
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

/**
 * Runs one wrapper action with a request-scoped PAC environment.
 * Existing host environment overrides are retained, but the disposable
 * runtime wins for profile and cache isolation.
 */
export async function withPacRuntimeParameters<T>(
  runnerParameters: RunnerParameters,
  operation: (runnerParameters: RunnerParameters) => Promise<T>,
  prefix = "pac-cli-"
): Promise<T> {
  return withPacRuntimeEnvironment(async runtime => operation({
    ...runnerParameters,
    pacEnvironment: {
      ...(runnerParameters.pacEnvironment ?? {}),
      ...runtime.environment,
    },
  }), prefix);
}
