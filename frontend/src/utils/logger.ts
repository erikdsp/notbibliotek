/**
 * Log levels supported by the logger.
 * @typedef {"debug" | "info" | "warn" | "error"} LogLevel
 */
type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Numeric priority for log levels.
 * Lower numbers are more verbose, higher numbers are more severe.
 * Used to determine whether a message should be logged based on the module's minimum level.
 *
 * @type {Record<LogLevel, number>}
 *
 * Priority mapping:
 * - debug: 0 (most verbose)
 * - info: 1
 * - warn: 2
 * - error: 3 (always logged)
 */
const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Global minimum log level override.
 *
 * When defined via the `VITE_GLOBAL_LOG_LEVEL` environment variable,
 * all log messages at or above this level will be printed regardless
 * of module-specific debug settings.
 *
 * Example:
 *   VITE_GLOBAL_LOG_LEVEL=warn
 *
 * Result:
 *   - `warn` and `error` messages always log
 *   - `info` and `debug` remain module-controlled
 *
 * If undefined, logging falls back to module-based configuration.
 * Note: `error` messages always log, independent of this setting.
 */
const globalLogLevel = (import.meta.env.VITE_GLOBAL_LOG_LEVEL ?? undefined) as
  | LogLevel
  | undefined;

/**
 * Function type for logging.
 * Accepts any number of arguments of unknown type.
 */
type LogFn = (...args: unknown[]) => void;

/**
 * Parses the environment variable `VITE_DEBUG_MODULES` to determine
 * which modules are enabled and their optional minimum log levels.
 *
 * Environment format:
 * ```
 * VITE_DEBUG_MODULES=ModuleA,ModuleB:warn
 * ```
 * - `ModuleA` → defaults to "debug" (logs all levels)
 * - `ModuleB:warn` → logs only "warn" and "error"
 *
 * The result is an array of tuples `[moduleName, minLevel]`.
 *
 * @type {[string, LogLevel][]}
 */
const modulesWithLevels = (import.meta.env.VITE_DEBUG_MODULES ?? "")
  .split(",")
  .map((m: string) => m.trim())
  .filter(Boolean)
  .map((m: string) => {
    const [name, level] = m.split(":");
    return [name, (level ?? "debug") as LogLevel];
  });

/**
 * Map of enabled modules to their minimum log level.
 *
 * - Keys are module names.
 * - Values are the minimum `LogLevel` for that module.
 * - Only modules present in `VITE_DEBUG_MODULES` are included.
 *
 */
const EnabledModules = new Map<string, LogLevel>(modulesWithLevels);

/**
 * True if running in Vite development mode.
 */
const isDev = import.meta.env.DEV;

/**
 * Creates a logger scoped to a specific module.
 *
 * Logging behavior:
 * - `error` messages always log.
 * - A global minimum level can be enforced via `VITE_GLOBAL_LOG_LEVEL`
 *   (e.g. `"warn"` logs all `warn` and `error` messages regardless of module settings).
 * - In development, modules listed in `VITE_DEBUG_MODULES` may define
 *   their own minimum log level (e.g. `ModuleA:info`).
 * - Messages must satisfy either the global minimum level or the
 *   module-specific minimum level to be logged.
 *
 * Console methods:
 * - `debug` → `console.log`
 * - `info`  → `console.info`
 * - `warn`  → `console.warn`
 * - `error` → `console.error`
 *
 * @param {string} module - Name of the module creating the logger.
 * @returns {Record<LogLevel, LogFn>} Logging functions for each log level.
 *
 * @example
 * ```ts
 * const log = createLogger("MimicView");
 * log.debug("Debug data", nodes);
 * log.warn("Potential issue detected");
 * log.error("Critical failure");
 * ```
 */
export function createLogger(module: string): Record<LogLevel, LogFn> {
  const minLevel = isDev ? EnabledModules.get(module) : undefined;

  const log =
    (level: LogLevel): LogFn =>
    (...args) => {
      const priority = logLevelPriority[level];

      // Always log errors
      if (level === "error") {
        console.error(`[${module}]`, ...args);
        return;
      }

      // Global override (e.g. warn+ always logs)
      if (globalLogLevel && priority >= logLevelPriority[globalLogLevel]) {
        consoleMethod(level)(module, args);
        return;
      }

      // Module-based logging (dev only)
      if (minLevel && priority >= logLevelPriority[minLevel]) {
        consoleMethod(level)(module, args);
      }
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  };
}

/**
 * Returns a console logging function for the given log level.
 *
 * - Prefixes all messages with the module name (e.g. `[ModuleName]`).
 * - Dispatches to the appropriate console method based on `level`.
 *
 * @param {LogLevel} level - The log level to bind (`debug`, `info`, `warn`, `error`).
 * @returns {(module: string, args: unknown[]) => void} A function that logs
 *   the provided arguments with module prefixing.
 */
function consoleMethod(level: LogLevel) {
  return (module: string, args: unknown[]) => {
    const prefix = `[${module}]`;

    switch (level) {
      case "debug":
        console.log(prefix, ...args);
        break;
      case "info":
        console.info(prefix, ...args);
        break;
      case "warn":
        console.warn(prefix, ...args);
        break;
      case "error":
        console.error(prefix, ...args);
        break;
    }
  };
}
