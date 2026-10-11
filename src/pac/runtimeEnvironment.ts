import { promises as fs } from "fs";
import { randomBytes } from "crypto";
import { homedir, platform, tmpdir } from "os";
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

export interface PersistentPacRuntimeEnvironment {
  /** Stable key representing one customer, tenant, and identity. */
  profileKey: string;
  /** Persistent root containing PAC profile and token-cache state. */
  root: string;
  /** Environment overrides to pass to PAC child processes. */
  environment: NodeJS.ProcessEnv;
  /** Idempotently releases this profile's cross-process lock without deleting authentication. */
  release: () => Promise<void>;
}

export interface PersistentPacRuntimeOptions {
  /** Parent directory for persistent PAC profiles. */
  storeRoot?: string;
  /** Maximum time to wait for another caller using the same profile. */
  lockTimeoutMs?: number;
  /** Delay between lock acquisition attempts. */
  lockRetryDelayMs?: number;
}

function validateProfileKey(profileKey: string): void {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(profileKey)) {
    throw new Error("PAC profile key must start with a letter or number and contain only letters, numbers, dots, underscores, and hyphens (maximum 64 characters)");
  }
}

async function createRuntimeDirectories(root: string): Promise<NodeJS.ProcessEnv> {
  const appData = join(root, "AppData", "Roaming");
  const localAppData = join(root, "AppData", "Local");
  const home = join(root, "home");
  const dotnetHome = join(root, "dotnet");
  const xdgConfig = join(root, "xdg", "config");
  const xdgData = join(root, "xdg", "data");
  const xdgCache = join(root, "xdg", "cache");

  await Promise.all([
    appData,
    localAppData,
    home,
    dotnetHome,
    xdgConfig,
    xdgData,
    xdgCache,
  ].map(directory => fs.mkdir(directory, { recursive: true })));

  const windowsRoot = parse(root).root.replace(/[\\/]$/, "");
  const windowsHome = root.slice(windowsRoot.length);
  return {
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
}

function defaultPersistentStoreRoot(): string {
  const dataRoot = platform() === "win32"
    ? process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local")
    : process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share");
  return join(dataRoot, "powerplatform-cli-wrapper", "pac-profiles");
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

async function removeAbandonedLock(lockPath: string): Promise<boolean> {
  try {
    const owner = JSON.parse(await fs.readFile(lockPath, "utf8")) as { pid?: number };
    if (typeof owner.pid === "number" && !isProcessRunning(owner.pid)) {
      await fs.rm(lockPath, { force: true });
      return true;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return true;
    }
  }
  return false;
}

async function acquireProfileLock(
  storeRoot: string,
  profileKey: string,
  timeoutMs: number,
  retryDelayMs: number,
): Promise<() => Promise<void>> {
  const lockDirectory = join(storeRoot, ".locks");
  const lockPath = join(lockDirectory, `${profileKey}.lock`);
  const token = randomBytes(16).toString("hex");
  const deadline = Date.now() + timeoutMs;
  await fs.mkdir(lockDirectory, { recursive: true });

  let timedOut = false;
  while (!timedOut) {
    try {
      const handle = await fs.open(lockPath, "wx");
      try {
        await handle.writeFile(JSON.stringify({ pid: process.pid, token, createdAt: new Date().toISOString() }));
      } finally {
        await handle.close();
      }

      let releasePromise: Promise<void> | undefined;
      return async () => {
        releasePromise ??= (async () => {
          try {
            const owner = JSON.parse(await fs.readFile(lockPath, "utf8")) as { token?: string };
            if (owner.token === token) {
              await fs.rm(lockPath, { force: true });
            }
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
              throw error;
            }
          }
        })();
        await releasePromise;
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
      if (await removeAbandonedLock(lockPath)) {
        continue;
      }
      timedOut = Date.now() >= deadline;
      if (timedOut) {
        throw new Error(`Timed out waiting for PAC profile '${profileKey}' after ${timeoutMs}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
  throw new Error(`Timed out waiting for PAC profile '${profileKey}' after ${timeoutMs}ms`);
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
  const environment = await createRuntimeDirectories(root);

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
 * Opens a persistent isolated PAC profile and holds a per-profile lock.
 * Reusing the same key retains PAC authentication across host sessions.
 */
export async function createPersistentPacRuntimeEnvironment(
  profileKey: string,
  options: PersistentPacRuntimeOptions = {},
): Promise<PersistentPacRuntimeEnvironment> {
  validateProfileKey(profileKey);
  const timeoutMs = options.lockTimeoutMs ?? 120000;
  const retryDelayMs = options.lockRetryDelayMs ?? 100;
  if (timeoutMs <= 0 || retryDelayMs <= 0) {
    throw new Error("PAC profile lock timeout and retry delay must be greater than zero");
  }

  const storeRoot = options.storeRoot ?? defaultPersistentStoreRoot();
  const root = join(storeRoot, profileKey);
  const release = await acquireProfileLock(storeRoot, profileKey, timeoutMs, retryDelayMs);
  try {
    const environment = await createRuntimeDirectories(root);
    return { profileKey, root, environment, release };
  } catch (error) {
    await release();
    throw error;
  }
}

/** Runs an operation with persistent keyed PAC authentication and always releases its profile lock. */
export async function withPersistentPacRuntimeEnvironment<T>(
  profileKey: string,
  operation: (runtime: PersistentPacRuntimeEnvironment) => Promise<T>,
  options: PersistentPacRuntimeOptions = {},
): Promise<T> {
  const runtime = await createPersistentPacRuntimeEnvironment(profileKey, options);
  try {
    return await operation(runtime);
  } finally {
    await runtime.release();
  }
}

/** Merges a persistent keyed PAC environment into one wrapper operation. */
export async function withPersistentPacRuntimeParameters<T>(
  profileKey: string,
  runnerParameters: RunnerParameters,
  operation: (runnerParameters: RunnerParameters) => Promise<T>,
  options: PersistentPacRuntimeOptions = {},
): Promise<T> {
  return withPersistentPacRuntimeEnvironment(profileKey, async runtime => operation({
    ...runnerParameters,
    pacEnvironment: {
      ...(runnerParameters.pacEnvironment ?? {}),
      ...runtime.environment,
    },
  }), options);
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
