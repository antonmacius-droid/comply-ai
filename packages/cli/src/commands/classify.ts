import chalk from "chalk";
import type { RiskLevel, AnnexIIICategory } from "@comply-ai/core";

interface ClassifyOptions {
  name: string;
  category: string;
  autonomousDecisions?: boolean;
  affectsNaturalPersons?: boolean;
  governmentUse?: boolean;
  interactsWithPersons?: boolean;
  trainingComputeFlops?: string;
  json?: boolean;
}

// Annex III category mapping
const ANNEX_III_CATEGORIES: Record<string, { index: number; label: string }> = {
  biometrics: { index: 1, label: "Biometric identification and categorisation" },
  critical_infrastructure: { index: 2, label: "Critical infrastructure" },
  education: { index: 3, label: "Education and vocational training" },
  employment: { index: 4, label: "Employment, worker management and access to self-employment" },
  essential_services: { index: 5, label: "Access to essential private/public services" },
  law_enforcement: { index: 6, label: "Law enforcement" },
  migration: { index: 7, label: "Migration, asylum and border control" },
  justice: { index: 8, label: "Administration of justice and democratic processes" },
};

// Article 5 prohibited practices
const PROHIBITED_CATEGORIES = [
  "social_scoring",
  "exploitation_vulnerable",
  "subliminal_manipulation",
  "biometric_categorization_sensitive",
  "facial_recognition_scraping",
  "emotion_inference_workplace",
  "real_time_biometric_identification",
  "predictive_policing",
];

// High-risk articles and their requirement summaries
const HIGH_RISK_ARTICLES: Array<{ article: string; title: string; requirement: string }> = [
  { article: "Article 8", title: "Compliance with requirements", requirement: "Comply with all Chapter 2 requirements" },
  { article: "Article 9", title: "Risk management system", requirement: "Establish and maintain a risk management system throughout the AI system lifecycle" },
  { article: "Article 10", title: "Data and data governance", requirement: "Training, validation, and testing datasets subject to data governance and management practices" },
  { article: "Article 11", title: "Technical documentation", requirement: "Draw up technical documentation before placing on the market" },
  { article: "Article 12", title: "Record-keeping", requirement: "Automatic recording of events (logs) throughout the AI system lifetime" },
  { article: "Article 13", title: "Transparency and information", requirement: "Design to allow deployers to interpret system output and use it appropriately" },
  { article: "Article 14", title: "Human oversight", requirement: "Designed to allow effective human oversight during use" },
  { article: "Article 15", title: "Accuracy, robustness, cybersecurity", requirement: "Achieve appropriate levels of accuracy, robustness, and cybersecurity" },
];

interface ClassificationResult {
  systemName: string;
  riskLevel: RiskLevel;
  category: string;
  annexIIICategory?: AnnexIIICategory;
  annexIIIIndex?: number;
  annexIIILabel?: string;
  gpaiTier?: "standard" | "systemic_risk";
  prohibitedPractice?: string;
  applicableArticles: string[];
  requirements: string[];
  conformityAssessment?: "internal" | "third_party";
  warnings: string[];
}

function classify(options: ClassifyOptions): ClassificationResult {
  const result: ClassificationResult = {
    systemName: options.name,
    riskLevel: "minimal",
    category: options.category,
    applicableArticles: [],
    requirements: [],
    warnings: [],
  };

  // Check prohibited practices (Article 5)
  if (PROHIBITED_CATEGORIES.includes(options.category)) {
    result.riskLevel = "prohibited";
    result.prohibitedPractice = options.category;
    result.applicableArticles = ["Article 5"];
    result.requirements = ["System is PROHIBITED under the EU AI Act and may not be placed on the market or put into service"];
    return result;
  }

  // Check GPAI (Articles 51-56)
  if (options.category === "gpai" || options.trainingComputeFlops) {
    result.riskLevel = "gpai";
    const flops = options.trainingComputeFlops ? parseFloat(options.trainingComputeFlops) : 0;

    if (flops >= 1e25) {
      result.gpaiTier = "systemic_risk";
      result.applicableArticles = ["Article 51", "Article 52", "Article 53", "Article 54", "Article 55", "Article 56"];
      result.requirements = [
        "Model evaluation per Article 55(1)(a)",
        "Adversarial testing for systemic risks",
        "Track and report serious incidents to AI Office",
        "Ensure adequate cybersecurity protections",
        "Technical documentation per Annex XI",
        "Acceptable use policy",
        "Comply with copyright Directive obligations",
      ];
    } else {
      result.gpaiTier = "standard";
      result.applicableArticles = ["Article 51", "Article 52", "Article 53"];
      result.requirements = [
        "Technical documentation per Annex XI",
        "Information to downstream providers",
        "Comply with copyright Directive obligations",
        "Publish sufficiently detailed summary of training content",
      ];
    }
    return result;
  }

  // Check high-risk (Annex III categories)
  const annexEntry = ANNEX_III_CATEGORIES[options.category];
  if (annexEntry) {
    result.riskLevel = "high";
    result.annexIIICategory = options.category as AnnexIIICategory;
    result.annexIIIIndex = annexEntry.index;
    result.annexIIILabel = annexEntry.label;

    result.applicableArticles = HIGH_RISK_ARTICLES.map((a) => a.article);
    result.requirements = HIGH_RISK_ARTICLES.map((a) => `${a.article}: ${a.requirement}`);

    // Conformity assessment type
    if (options.category === "biometrics") {
      result.conformityAssessment = "third_party";
      result.applicableArticles.push("Article 43(1) — Third-party conformity assessment");
    } else {
      result.conformityAssessment = "internal";
      result.applicableArticles.push("Article 43(1) — Internal conformity assessment");
    }

    // Additional requirements for autonomous decisions
    if (options.autonomousDecisions) {
      result.requirements.push(
        "Article 14(4): Enhanced human oversight — system makes autonomous decisions"
      );
      result.warnings.push(
        "Autonomous decision-making increases scrutiny. Ensure human override capability."
      );
    }

    // EU database registration
    result.requirements.push("Article 49: Registration in EU database before placing on market");
    result.applicableArticles.push("Article 49");

    return result;
  }

  // Check limited risk (chatbots, deepfakes, emotion recognition)
  const limitedCategories = ["chatbot", "deepfake", "emotion_recognition", "biometric_categorization"];
  if (limitedCategories.includes(options.category) || options.interactsWithPersons) {
    result.riskLevel = "limited";
    result.applicableArticles = ["Article 50"];
    result.requirements = [];

    if (options.category === "chatbot" || options.interactsWithPersons) {
      result.requirements.push("Article 50(1): Inform natural persons they are interacting with an AI system");
    }
    if (options.category === "deepfake") {
      result.requirements.push("Article 50(4): Label content as artificially generated or manipulated");
    }
    if (options.category === "emotion_recognition") {
      result.requirements.push("Article 50(3): Inform natural persons of emotion recognition system operation");
    }
    if (options.category === "biometric_categorization") {
      result.requirements.push("Article 50(3): Inform natural persons of biometric categorisation system");
    }

    return result;
  }

  // Default: minimal risk
  result.riskLevel = "minimal";
  result.applicableArticles = ["Article 95"];
  result.requirements = [
    "Voluntary codes of conduct encouraged (Article 95)",
    "Consider transparency best practices",
  ];

  return result;
}

export async function classifyCommand(options: ClassifyOptions): Promise<void> {
  const result = classify(options);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log();

  // Risk level banner
  switch (result.riskLevel) {
    case "prohibited":
      console.log(chalk.bgRed.white.bold(" PROHIBITED "));
      console.log(chalk.red.bold(`System "${result.systemName}" falls under a PROHIBITED practice`));
      if (result.prohibitedPractice) {
        console.log(chalk.red(`Practice: ${result.prohibitedPractice}`));
      }
      break;
    case "high":
      console.log(chalk.bgYellow.black.bold(" HIGH RISK "));
      console.log(
        chalk.yellow.bold(
          `Annex III, Category ${result.annexIIIIndex}: ${result.annexIIILabel}`
        )
      );
      if (result.conformityAssessment) {
        console.log(
          chalk.yellow(
            `Conformity Assessment: ${result.conformityAssessment === "third_party" ? "Third-party required" : "Internal (self-assessment)"}`
          )
        );
      }
      break;
    case "limited":
      console.log(chalk.bgCyan.black.bold(" LIMITED RISK "));
      console.log(chalk.cyan("Transparency obligations apply (Article 50)"));
      break;
    case "gpai":
      console.log(chalk.bgMagenta.white.bold(" GPAI MODEL "));
      console.log(
        chalk.magenta(
          `Tier: ${result.gpaiTier === "systemic_risk" ? "Systemic Risk (>10^25 FLOPs)" : "Standard"}`
        )
      );
      break;
    default:
      console.log(chalk.bgGreen.black.bold(" MINIMAL RISK "));
      console.log(chalk.green("No mandatory obligations. Voluntary codes of conduct apply."));
  }

  console.log();

  // Applicable articles
  if (result.applicableArticles.length > 0) {
    console.log(chalk.bold("Applicable Articles:"));
    for (const article of result.applicableArticles) {
      console.log(chalk.gray(`  - ${article}`));
    }
    console.log();
  }

  // Requirements
  if (result.requirements.length > 0) {
    console.log(chalk.bold("Requirements:"));
    for (const req of result.requirements) {
      console.log(`  ${chalk.white(req)}`);
    }
    console.log();
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log(chalk.yellow.bold("Warnings:"));
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  ${warning}`));
    }
    console.log();
  }
}
