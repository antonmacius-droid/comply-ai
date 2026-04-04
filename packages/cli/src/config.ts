import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

export interface ComplyConfig {
  server?: string;
  api_key?: string;
  default_system_id?: string;
  organization?: string;
}

const CONFIG_FILENAME = ".comply-ai.yml";

/**
 * Search for .comply-ai.yml starting from cwd and walking up to root.
 */
function findConfigFile(): string | null {
  let dir = process.cwd();
  while (true) {
    const candidate = resolve(dir, CONFIG_FILENAME);
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Load configuration from .comply-ai.yml.
 * Returns empty config if no file found.
 */
export function loadConfig(): ComplyConfig {
  const configPath = findConfigFile();
  if (!configPath) {
    return {};
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = yaml.load(raw) as Record<string, unknown>;
    return {
      server: typeof parsed.server === "string" ? parsed.server : undefined,
      api_key: typeof parsed.api_key === "string" ? parsed.api_key : undefined,
      default_system_id:
        typeof parsed.default_system_id === "string"
          ? parsed.default_system_id
          : undefined,
      organization:
        typeof parsed.organization === "string"
          ? parsed.organization
          : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Resolve a parameter: CLI flag > env var > config file.
 */
export function resolveParam(
  cliValue: string | undefined,
  envKey: string,
  configValue: string | undefined
): string | undefined {
  return cliValue ?? process.env[envKey] ?? configValue;
}
