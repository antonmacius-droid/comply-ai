import { Command } from "commander";
import chalk from "chalk";
import { checkCommand } from "./commands/check.js";
import { classifyCommand } from "./commands/classify.js";
import { modelCardCommand } from "./commands/model-card.js";
import { statusCommand } from "./commands/status.js";
import { registerCommand } from "./commands/register.js";
import { initCommand } from "./commands/init.js";

const program = new Command();

program
  .name("comply-ai")
  .description("EU AI Act Compliance Engine — classify, document, and monitor your AI systems")
  .version("0.1.0");

program
  .command("check")
  .description("Run compliance checks against Comply AI server")
  .option("-s, --system-id <id>", "AI system ID to check")
  .option("--server <url>", "Comply AI server URL")
  .option("--api-key <key>", "API key for authentication")
  .option("--fail-on-warning", "Exit with code 1 on warnings too")
  .action(checkCommand);

program
  .command("classify")
  .description("Classify risk level of an AI system (offline, no server needed)")
  .requiredOption("-n, --name <name>", "Name of the AI system")
  .requiredOption("-c, --category <category>", "System category (employment, biometrics, education, etc.)")
  .option("--autonomous-decisions", "System makes autonomous decisions affecting persons")
  .option("--affects-natural-persons", "System affects natural persons")
  .option("--government-use", "System is used by government/public authorities")
  .option("--interacts-with-persons", "System interacts directly with natural persons")
  .option("--training-compute-flops <flops>", "Training compute in FLOPs (for GPAI)")
  .option("--json", "Output as JSON")
  .action(classifyCommand);

program
  .command("model-card")
  .description("Generate or validate a model card")
  .argument("<action>", "Action: generate or validate")
  .argument("[file]", "Path to model card file (for validate)")
  .option("-n, --name <name>", "System name (for generate)")
  .option("-d, --description <desc>", "System description (for generate)")
  .option("-c, --category <category>", "System category (for generate)")
  .option("-o, --output <path>", "Output file path", "model-card.json")
  .action(modelCardCommand);

program
  .command("status")
  .description("Show compliance status for a system")
  .option("-s, --system-id <id>", "AI system ID")
  .option("--server <url>", "Comply AI server URL")
  .option("--api-key <key>", "API key for authentication")
  .option("--json", "Output as JSON")
  .action(statusCommand);

program
  .command("register")
  .description("Register a new AI system")
  .requiredOption("-n, --name <name>", "Name of the AI system")
  .requiredOption("-c, --category <category>", "System category")
  .option("-d, --description <desc>", "System description")
  .option("--provider <provider>", "System provider/developer")
  .option("--server <url>", "Comply AI server URL")
  .option("--api-key <key>", "API key for authentication")
  .action(registerCommand);

program
  .command("init")
  .description("Initialize .comply-ai.yml config file")
  .option("--server <url>", "Comply AI server URL")
  .option("--api-key <key>", "API key")
  .option("--system-id <id>", "Default system ID")
  .option("--force", "Overwrite existing config")
  .action(initCommand);

program.addHelpText("after", `
${chalk.bold("Examples:")}
  ${chalk.gray("# Classify a system (no server needed)")}
  $ comply-ai classify --name "Resume Screener" --category employment --autonomous-decisions

  ${chalk.gray("# Run compliance check")}
  $ comply-ai check --system-id sys_abc123

  ${chalk.gray("# Generate a model card")}
  $ comply-ai model-card generate --name "Resume Screener" --output model-card.json

  ${chalk.gray("# Initialize config")}
  $ comply-ai init --server https://comply.yourcompany.com
`);

program.parse();
