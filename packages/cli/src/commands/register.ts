import chalk from "chalk";
import ora from "ora";
import { loadConfig, resolveParam } from "../config.js";
import { ApiClient } from "../api-client.js";

interface RegisterOptions {
  name: string;
  category: string;
  description?: string;
  provider?: string;
  server?: string;
  apiKey?: string;
}

export async function registerCommand(options: RegisterOptions): Promise<void> {
  const config = loadConfig();

  const server = resolveParam(options.server, "COMPLY_AI_SERVER", config.server);
  const apiKey = resolveParam(options.apiKey, "COMPLY_AI_API_KEY", config.api_key);

  if (!server) {
    console.error(chalk.red("Error: Server URL required."));
    console.error(chalk.gray("  Use --server, COMPLY_AI_SERVER env var, or .comply-ai.yml"));
    process.exit(1);
  }

  if (!apiKey) {
    console.error(chalk.red("Error: API key required."));
    console.error(chalk.gray("  Use --api-key, COMPLY_AI_API_KEY env var, or .comply-ai.yml"));
    process.exit(1);
  }

  const spinner = ora(`Registering "${options.name}"...`).start();

  const client = new ApiClient({ server, apiKey });
  const result = await client.registerSystem({
    name: options.name,
    category: options.category,
    description: options.description,
    provider: options.provider,
  });

  if (!result.ok || !result.data) {
    spinner.fail(chalk.red(`Registration failed: ${result.error}`));
    process.exit(1);
  }

  const { data } = result;
  spinner.succeed(chalk.green(`System registered successfully`));

  console.log();
  console.log(chalk.bold("System ID:"), chalk.cyan(data.id));
  console.log(chalk.bold("Name:"), data.name);
  console.log(chalk.bold("Category:"), data.category);
  console.log(chalk.bold("Risk Level:"), data.riskLevel);
  console.log(chalk.bold("Status:"), data.status);
  console.log(chalk.bold("Created:"), data.createdAt);
  console.log();
  console.log(chalk.gray("Next steps:"));
  console.log(chalk.gray(`  1. Run: comply-ai status --system-id ${data.id}`));
  console.log(chalk.gray(`  2. Run: comply-ai check --system-id ${data.id}`));
  console.log(chalk.gray(`  3. Update .comply-ai.yml with: default_system_id: ${data.id}`));
}
