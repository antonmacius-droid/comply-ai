import chalk from "chalk";
import ora from "ora";
import { loadConfig, resolveParam } from "../config.js";
import { ApiClient } from "../api-client.js";

interface CheckOptions {
  systemId?: string;
  server?: string;
  apiKey?: string;
  failOnWarning?: boolean;
}

export async function checkCommand(options: CheckOptions): Promise<void> {
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
    console.error(
      chalk.gray("  Use --server, COMPLY_AI_SERVER env var, or .comply-ai.yml")
    );
    process.exit(1);
  }

  if (!apiKey) {
    console.error(chalk.red("Error: API key required."));
    console.error(
      chalk.gray("  Use --api-key, COMPLY_AI_API_KEY env var, or .comply-ai.yml")
    );
    process.exit(1);
  }

  if (!systemId) {
    console.error(chalk.red("Error: System ID required."));
    console.error(chalk.gray("  Use --system-id or set default_system_id in .comply-ai.yml"));
    process.exit(1);
  }

  const spinner = ora("Running compliance checks...").start();
  const client = new ApiClient({ server, apiKey });
  const result = await client.complianceCheck(systemId);

  if (!result.ok || !result.data) {
    spinner.fail(chalk.red(`Compliance check failed: ${result.error}`));
    process.exit(1);
  }

  const { data } = result;

  if (data.status === "pass") {
    spinner.succeed(chalk.green("All compliance checks passed"));
  } else if (data.status === "warning") {
    spinner.warn(chalk.yellow("Compliance checks passed with warnings"));
  } else {
    spinner.fail(chalk.red("Compliance checks FAILED"));
  }

  console.log();
  console.log(chalk.bold("System:"), systemId);
  console.log(chalk.bold("Risk Level:"), formatRiskLevel(data.riskLevel));
  console.log(chalk.bold("Timestamp:"), data.timestamp);
  console.log();

  // Print individual checks
  for (const check of data.checks) {
    const icon =
      check.status === "pass"
        ? chalk.green("PASS")
        : check.status === "warning"
          ? chalk.yellow("WARN")
          : chalk.red("FAIL");

    console.log(`  ${icon}  ${check.name}`);
    if (check.status !== "pass") {
      console.log(chalk.gray(`         ${check.message}`));
    }
  }

  console.log();

  const failCount = data.checks.filter((c) => c.status === "fail").length;
  const warnCount = data.checks.filter((c) => c.status === "warning").length;
  const passCount = data.checks.filter((c) => c.status === "pass").length;

  console.log(
    `${chalk.green(`${passCount} passed`)}  ${chalk.yellow(`${warnCount} warnings`)}  ${chalk.red(`${failCount} failed`)}`
  );

  // Exit code for CI
  if (data.status === "fail") {
    process.exit(1);
  }
  if (options.failOnWarning && data.status === "warning") {
    process.exit(1);
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
