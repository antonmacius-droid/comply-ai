import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import chalk from "chalk";
import yaml from "js-yaml";

interface InitOptions {
  server?: string;
  apiKey?: string;
  systemId?: string;
  force?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const configPath = resolve(process.cwd(), ".comply-ai.yml");

  if (existsSync(configPath) && !options.force) {
    console.error(chalk.red("Error: .comply-ai.yml already exists."));
    console.error(chalk.gray("  Use --force to overwrite."));
    process.exit(1);
  }

  const config: Record<string, string> = {};

  if (options.server) {
    config.server = options.server;
  } else {
    config.server = "https://comply.yourcompany.com";
  }

  if (options.apiKey) {
    config.api_key = options.apiKey;
  } else {
    config.api_key = "cai_your_api_key_here";
  }

  if (options.systemId) {
    config.default_system_id = options.systemId;
  } else {
    config.default_system_id = "sys_your_system_id";
  }

  config.organization = "Your Organization";

  const yamlContent = yaml.dump(config, {
    quotingType: '"',
    forceQuotes: false,
    lineWidth: -1,
  });

  const fileContent = `# Comply AI Configuration
# https://github.com/comply-ai/comply-ai
#
# Values can also be set via environment variables:
#   COMPLY_AI_SERVER, COMPLY_AI_API_KEY, COMPLY_AI_SYSTEM_ID

${yamlContent}`;

  writeFileSync(configPath, fileContent);

  console.log(chalk.green(`Created ${configPath}`));
  console.log();
  console.log(chalk.gray("Next steps:"));
  console.log(chalk.gray("  1. Update server URL and API key in .comply-ai.yml"));
  console.log(chalk.gray("  2. Add .comply-ai.yml to .gitignore (contains API key)"));
  console.log(chalk.gray("  3. Run: comply-ai check"));
}
