import chalk from "chalk";
import ora from "ora";
import { loadConfig, resolveParam } from "../config.js";
import { ApiClient } from "../api-client.js";

interface StatusOptions {
  systemId?: string;
  server?: string;
  apiKey?: string;
  json?: boolean;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  const config = loadConfig();

  const server = resolveParam(options.server, "COMPLY_AI_SERVER", config.server);
  const apiKey = resolveParam(options.apiKey, "COMPLY_AI_API_KEY", config.api_key);
  const systemId = resolveParam(
    options.systemId,
    "COMPLY_AI_SYSTEM_ID",
    config.default_system_id
  );

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

  if (!systemId) {
    console.error(chalk.red("Error: System ID required."));
    console.error(chalk.gray("  Use --system-id or set default_system_id in .comply-ai.yml"));
    process.exit(1);
  }

  const spinner = ora("Fetching compliance status...").start();
  const client = new ApiClient({ server, apiKey });
  const result = await client.getSystemStatus(systemId);

  if (!result.ok || !result.data) {
    spinner.fail(chalk.red(`Failed to fetch status: ${result.error}`));
    process.exit(1);
  }

  spinner.stop();
  const { data } = result;

  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold("System:"), data.name);
  console.log(chalk.bold("ID:"), data.id);
  console.log(chalk.bold("Status:"), formatStatus(data.status));
  console.log(chalk.bold("Risk Level:"), formatRiskLevel(data.riskLevel));
  console.log(chalk.bold("Compliance Score:"), formatScore(data.complianceScore));
  console.log(chalk.bold("Documents:"), data.documentsCount);
  console.log(chalk.bold("Last Assessed:"), data.lastAssessed);
  console.log();

  if (data.requirements && data.requirements.length > 0) {
    console.log(chalk.bold("Requirements:"));
    for (const req of data.requirements) {
      const icon =
        req.status === "met"
          ? chalk.green("MET ")
          : req.status === "partial"
            ? chalk.yellow("PART")
            : chalk.red("UNMT");

      console.log(`  ${icon}  ${req.article} — ${req.title}`);
    }
    console.log();
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "compliant":
      return chalk.green.bold("Compliant");
    case "non_compliant":
      return chalk.red.bold("Non-Compliant");
    case "under_review":
      return chalk.yellow.bold("Under Review");
    case "draft":
      return chalk.gray("Draft");
    case "decommissioned":
      return chalk.gray.strikethrough("Decommissioned");
    default:
      return status;
  }
}

function formatRiskLevel(level: string): string {
  switch (level) {
    case "prohibited":
      return chalk.bgRed.white.bold(" PROHIBITED ");
    case "high":
      return chalk.bgYellow.black.bold(" HIGH RISK ");
    case "limited":
      return chalk.bgCyan.black.bold(" LIMITED ");
    case "minimal":
      return chalk.bgGreen.black.bold(" MINIMAL ");
    case "gpai":
      return chalk.bgMagenta.white.bold(" GPAI ");
    default:
      return chalk.gray(level);
  }
}

function formatScore(score: number): string {
  const percentage = Math.round(score * 100);
  const bar = "=".repeat(Math.floor(percentage / 5)) + " ".repeat(20 - Math.floor(percentage / 5));

  if (percentage >= 80) {
    return chalk.green(`[${bar}] ${percentage}%`);
  } else if (percentage >= 50) {
    return chalk.yellow(`[${bar}] ${percentage}%`);
  } else {
    return chalk.red(`[${bar}] ${percentage}%`);
  }
}
