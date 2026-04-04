import { readFileSync, writeFileSync, existsSync } from "node:fs";
import chalk from "chalk";
import ora from "ora";

interface ModelCardOptions {
  name?: string;
  description?: string;
  category?: string;
  output?: string;
}

interface ModelCard {
  schema_version: string;
  model_details: {
    name: string;
    description: string;
    version: string;
    developer: string;
    release_date: string;
    model_type: string;
    license: string;
  };
  intended_use: {
    primary_use_cases: string[];
    out_of_scope_use_cases: string[];
    users: string[];
  };
  eu_ai_act: {
    risk_level: string;
    annex_iii_category: string;
    applicable_articles: string[];
    conformity_assessment_type: string;
    registered_in_eu_database: boolean;
  };
  training_data: {
    description: string;
    preprocessing: string;
    size: string;
    data_governance: string;
  };
  evaluation: {
    metrics: Array<{ name: string; value: string; description: string }>;
    testing_methodology: string;
    bias_evaluation: string;
  };
  limitations: {
    known_limitations: string[];
    risks: string[];
    mitigation_strategies: string[];
  };
  transparency: {
    explainability: string;
    human_oversight: string;
    logging: string;
  };
  maintenance: {
    monitoring_plan: string;
    update_frequency: string;
    incident_reporting: string;
  };
}

const REQUIRED_FIELDS = [
  "schema_version",
  "model_details",
  "model_details.name",
  "model_details.description",
  "model_details.version",
  "model_details.developer",
  "intended_use",
  "intended_use.primary_use_cases",
  "eu_ai_act",
  "eu_ai_act.risk_level",
  "training_data",
  "evaluation",
  "limitations",
  "transparency",
  "transparency.human_oversight",
  "maintenance",
];

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function validateModelCard(card: Record<string, unknown>): Array<{ field: string; message: string; severity: "error" | "warning" }> {
  const issues: Array<{ field: string; message: string; severity: "error" | "warning" }> = [];

  for (const field of REQUIRED_FIELDS) {
    const value = getNestedValue(card, field);
    if (value === undefined || value === null) {
      issues.push({
        field,
        message: `Required field "${field}" is missing`,
        severity: "error",
      });
    } else if (typeof value === "string" && value.trim() === "") {
      issues.push({
        field,
        message: `Required field "${field}" is empty`,
        severity: "error",
      });
    } else if (Array.isArray(value) && value.length === 0) {
      issues.push({
        field,
        message: `Required field "${field}" is an empty array`,
        severity: "warning",
      });
    }
  }

  // EU AI Act specific checks
  const riskLevel = getNestedValue(card, "eu_ai_act.risk_level") as string | undefined;
  if (riskLevel === "high") {
    const conformity = getNestedValue(card, "eu_ai_act.conformity_assessment_type");
    if (!conformity) {
      issues.push({
        field: "eu_ai_act.conformity_assessment_type",
        message: "High-risk systems require conformity assessment type",
        severity: "error",
      });
    }

    const humanOversight = getNestedValue(card, "transparency.human_oversight");
    if (!humanOversight || (typeof humanOversight === "string" && humanOversight.trim() === "")) {
      issues.push({
        field: "transparency.human_oversight",
        message: "High-risk systems require human oversight documentation (Article 14)",
        severity: "error",
      });
    }

    const monitoring = getNestedValue(card, "maintenance.monitoring_plan");
    if (!monitoring || (typeof monitoring === "string" && monitoring.trim() === "")) {
      issues.push({
        field: "maintenance.monitoring_plan",
        message: "High-risk systems require post-market monitoring plan",
        severity: "warning",
      });
    }
  }

  // Check for placeholder values
  const placeholderPattern = /TODO|TBD|FIXME|PLACEHOLDER|\[.*\]/i;
  function checkPlaceholders(obj: unknown, prefix: string): void {
    if (typeof obj === "string" && placeholderPattern.test(obj)) {
      issues.push({
        field: prefix,
        message: `Contains placeholder value: "${obj}"`,
        severity: "warning",
      });
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        checkPlaceholders(value, prefix ? `${prefix}.${key}` : key);
      }
    }
  }
  checkPlaceholders(card, "");

  return issues;
}

function generateModelCard(options: ModelCardOptions): ModelCard {
  return {
    schema_version: "1.0.0",
    model_details: {
      name: options.name ?? "AI System Name",
      description: options.description ?? "Description of the AI system and its purpose",
      version: "1.0.0",
      developer: "Organization Name",
      release_date: new Date().toISOString().split("T")[0]!,
      model_type: "TODO: Specify model type (e.g., classification, generation, recommendation)",
      license: "TODO: Specify license",
    },
    intended_use: {
      primary_use_cases: [
        "TODO: Describe primary intended use case",
      ],
      out_of_scope_use_cases: [
        "TODO: List use cases this system should NOT be used for",
      ],
      users: [
        "TODO: Describe intended users and their expertise level",
      ],
    },
    eu_ai_act: {
      risk_level: options.category ? inferRiskLevel(options.category) : "TODO: high | limited | minimal",
      annex_iii_category: options.category ?? "TODO: Specify Annex III category if high-risk",
      applicable_articles: [],
      conformity_assessment_type: "internal",
      registered_in_eu_database: false,
    },
    training_data: {
      description: "TODO: Describe training data sources, collection methodology",
      preprocessing: "TODO: Describe data preprocessing and cleaning steps",
      size: "TODO: Specify dataset size",
      data_governance: "TODO: Describe data governance practices per Article 10",
    },
    evaluation: {
      metrics: [
        {
          name: "accuracy",
          value: "TODO",
          description: "Overall classification accuracy",
        },
      ],
      testing_methodology: "TODO: Describe testing methodology",
      bias_evaluation: "TODO: Describe bias evaluation methodology and results",
    },
    limitations: {
      known_limitations: [
        "TODO: Document known limitations",
      ],
      risks: [
        "TODO: Document identified risks",
      ],
      mitigation_strategies: [
        "TODO: Describe risk mitigation strategies",
      ],
    },
    transparency: {
      explainability: "TODO: Describe how the system's decisions can be explained",
      human_oversight: "TODO: Describe human oversight measures per Article 14",
      logging: "TODO: Describe logging and record-keeping per Article 12",
    },
    maintenance: {
      monitoring_plan: "TODO: Describe post-market monitoring plan per Article 72",
      update_frequency: "TODO: Specify model update and review frequency",
      incident_reporting: "TODO: Describe serious incident reporting process per Article 62",
    },
  };
}

function inferRiskLevel(category: string): string {
  const highRiskCategories = [
    "biometrics", "critical_infrastructure", "education",
    "employment", "essential_services", "law_enforcement",
    "migration", "justice",
  ];
  if (highRiskCategories.includes(category)) return "high";
  if (["chatbot", "deepfake", "emotion_recognition"].includes(category)) return "limited";
  return "minimal";
}

export async function modelCardCommand(
  action: string,
  file: string | undefined,
  options: ModelCardOptions
): Promise<void> {
  if (action === "validate") {
    if (!file) {
      console.error(chalk.red("Error: Please provide a model card file path."));
      console.error(chalk.gray("  Usage: comply-ai model-card validate model-card.json"));
      process.exit(1);
    }

    if (!existsSync(file)) {
      console.error(chalk.red(`Error: File not found: ${file}`));
      process.exit(1);
    }

    const spinner = ora("Validating model card...").start();

    let card: Record<string, unknown>;
    try {
      const raw = readFileSync(file, "utf-8");
      card = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      spinner.fail(chalk.red("Failed to parse model card JSON"));
      process.exit(1);
    }

    const issues = validateModelCard(card);
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");

    if (errors.length === 0 && warnings.length === 0) {
      spinner.succeed(chalk.green("Model card is valid"));
      return;
    }

    if (errors.length === 0) {
      spinner.warn(chalk.yellow("Model card valid with warnings"));
    } else {
      spinner.fail(chalk.red("Model card validation failed"));
    }

    console.log();

    if (errors.length > 0) {
      console.log(chalk.red.bold(`${errors.length} error(s):`));
      for (const err of errors) {
        console.log(chalk.red(`  FAIL  ${err.field}: ${err.message}`));
      }
      console.log();
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow.bold(`${warnings.length} warning(s):`));
      for (const warn of warnings) {
        console.log(chalk.yellow(`  WARN  ${warn.field}: ${warn.message}`));
      }
      console.log();
    }

    if (errors.length > 0) {
      process.exit(1);
    }
  } else if (action === "generate") {
    const outputPath = file ?? options.output ?? "model-card.json";

    if (existsSync(outputPath)) {
      console.error(chalk.red(`Error: File already exists: ${outputPath}`));
      console.error(chalk.gray("  Delete it first or specify a different output path."));
      process.exit(1);
    }

    const spinner = ora("Generating model card template...").start();
    const card = generateModelCard(options);
    writeFileSync(outputPath, JSON.stringify(card, null, 2) + "\n");
    spinner.succeed(chalk.green(`Model card generated: ${outputPath}`));
    console.log();
    console.log(chalk.gray("Fill in the TODO fields, then validate:"));
    console.log(chalk.gray(`  comply-ai model-card validate ${outputPath}`));
  } else {
    console.error(chalk.red(`Unknown action: ${action}`));
    console.error(chalk.gray("  Usage: comply-ai model-card <generate|validate> [file]"));
    process.exit(1);
  }
}
