/**
 * Model Card Validator — Validate model cards against EU AI Act requirements
 *
 * Checks required fields, validates structure, and reports missing/incomplete
 * sections based on the system's risk level.
 */

import { ModelCardSchema } from "./schema.js";
import type { ModelCard, RegulatoryInfo } from "./schema.js";
import type { RiskLevel } from "../types/eu-ai-act.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  field: string;
  severity: "error" | "warning";
  message: string;
  article?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  completeness: number; // 0-1, percentage of fields filled
  missingSections: string[];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a model card object against the schema and EU AI Act requirements.
 *
 * @param card The model card to validate
 * @param riskLevel Optional risk level to apply additional checks
 */
export function validateModelCard(
  card: unknown,
  riskLevel?: RiskLevel
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const missingSections: string[] = [];

  // Step 1: Zod schema validation
  const parseResult = ModelCardSchema.safeParse(card);
  if (!parseResult.success) {
    for (const err of parseResult.error.errors) {
      issues.push({
        field: err.path.join("."),
        severity: "error",
        message: err.message,
      });
    }
    return {
      valid: false,
      issues,
      completeness: 0,
      missingSections: ["Schema validation failed — cannot assess sections"],
    };
  }

  const validCard = parseResult.data;

  // Step 2: Check section completeness
  let totalFields = 0;
  let filledFields = 0;

  // Helper to count filled-ness
  const checkField = (value: unknown, fieldName: string, required: boolean, article?: string) => {
    totalFields++;
    const isFilled =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0);

    if (isFilled) {
      filledFields++;
    } else if (required) {
      issues.push({
        field: fieldName,
        severity: "error",
        message: `Required field "${fieldName}" is missing or empty`,
        article,
      });
    }
    return isFilled;
  };

  // Identification
  checkField(validCard.identification.name, "identification.name", true);
  checkField(validCard.identification.version, "identification.version", true);
  checkField(validCard.identification.provider, "identification.provider", true, "Annex IV");
  checkField(validCard.identification.providerContact, "identification.providerContact", false, "Annex IV");
  checkField(validCard.identification.modelType, "identification.modelType", false);
  checkField(validCard.identification.architecture, "identification.architecture", false, "Annex XI");

  // Intended use
  checkField(validCard.intendedUse.purpose, "intendedUse.purpose", true, "Art. 13(3)(b)");
  checkField(validCard.intendedUse.intendedUsers, "intendedUse.intendedUsers", true);
  checkField(validCard.intendedUse.outOfScopeUses, "intendedUse.outOfScopeUses", false, "Art. 13(3)(b)");

  // Training data
  checkField(validCard.trainingData.description, "trainingData.description", true, "Annex XI");
  checkField(validCard.trainingData.sources, "trainingData.sources", false, "Art. 53(1)(d)");
  checkField(validCard.trainingData.knownBiases, "trainingData.knownBiases", false, "Art. 10(2)(f)");

  // Evaluation
  checkField(validCard.evaluation.metrics, "evaluation.metrics", true, "Art. 15(2)");
  checkField(validCard.evaluation.limitations, "evaluation.limitations", false, "Art. 13(3)(b)");

  // Optional sections — track if present
  if (!validCard.computationalResources) {
    missingSections.push("computationalResources");
  } else {
    checkField(validCard.computationalResources.trainingCompute, "computationalResources.trainingCompute", false, "Annex XI");
  }

  if (!validCard.riskMitigation) {
    missingSections.push("riskMitigation");
  } else {
    checkField(validCard.riskMitigation.identifiedRisks, "riskMitigation.identifiedRisks", false, "Art. 9");
    checkField(validCard.riskMitigation.mitigationMeasures, "riskMitigation.mitigationMeasures", false, "Art. 9");
  }

  if (!validCard.regulatoryInfo) {
    missingSections.push("regulatoryInfo");
  }

  // Step 3: Risk-level-specific checks
  const effectiveRiskLevel =
    riskLevel ?? (validCard.regulatoryInfo as RegulatoryInfo | undefined)?.euAIActRiskLevel;

  if (effectiveRiskLevel === "high") {
    applyHighRiskChecks(validCard, issues, missingSections);
  } else if (effectiveRiskLevel === "gpai") {
    applyGPAIChecks(validCard, issues, missingSections);
  }

  const completeness = totalFields > 0 ? filledFields / totalFields : 0;

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
    completeness: Math.round(completeness * 100) / 100,
    missingSections,
  };
}

// ---------------------------------------------------------------------------
// Risk-level specific checks
// ---------------------------------------------------------------------------

function applyHighRiskChecks(
  card: ModelCard,
  issues: ValidationIssue[],
  missingSections: string[]
): void {
  // Art. 9 — Risk management
  if (!card.riskMitigation) {
    issues.push({
      field: "riskMitigation",
      severity: "error",
      message: "High-risk systems require documented risk identification and mitigation (Art. 9)",
      article: "Art. 9",
    });
  } else {
    if (!card.riskMitigation.identifiedRisks || card.riskMitigation.identifiedRisks.length === 0) {
      issues.push({
        field: "riskMitigation.identifiedRisks",
        severity: "error",
        message: "High-risk systems must document identified risks (Art. 9(2))",
        article: "Art. 9(2)",
      });
    }
    if (!card.riskMitigation.mitigationMeasures || card.riskMitigation.mitigationMeasures.length === 0) {
      issues.push({
        field: "riskMitigation.mitigationMeasures",
        severity: "error",
        message: "High-risk systems must document risk mitigation measures (Art. 9(2)(d))",
        article: "Art. 9(2)(d)",
      });
    }
    if (!card.riskMitigation.humanOversightMeasures) {
      issues.push({
        field: "riskMitigation.humanOversightMeasures",
        severity: "warning",
        message: "High-risk systems should document human oversight measures (Art. 14)",
        article: "Art. 14",
      });
    }
  }

  // Art. 10 — Data governance
  if (!card.trainingData.dataGovernance) {
    issues.push({
      field: "trainingData.dataGovernance",
      severity: "warning",
      message: "High-risk systems should document data governance practices (Art. 10)",
      article: "Art. 10",
    });
  }

  // Art. 15 — Accuracy metrics
  if (card.evaluation.metrics.length === 0) {
    issues.push({
      field: "evaluation.metrics",
      severity: "error",
      message: "High-risk systems must declare accuracy metrics (Art. 15(2))",
      article: "Art. 15(2)",
    });
  }

  // Art. 13 — Transparency
  if (!card.intendedUse.outOfScopeUses || card.intendedUse.outOfScopeUses.length === 0) {
    issues.push({
      field: "intendedUse.outOfScopeUses",
      severity: "warning",
      message: "High-risk systems should document out-of-scope uses (Art. 13(3)(b))",
      article: "Art. 13(3)(b)",
    });
  }

  // Regulatory info
  if (!card.regulatoryInfo) {
    issues.push({
      field: "regulatoryInfo",
      severity: "warning",
      message: "High-risk systems should include regulatory classification information",
    });
    missingSections.push("regulatoryInfo (required for high-risk)");
  }
}

function applyGPAIChecks(
  card: ModelCard,
  issues: ValidationIssue[],
  _missingSections: string[]
): void {
  // Annex XI — Architecture
  if (!card.identification.architecture) {
    issues.push({
      field: "identification.architecture",
      severity: "error",
      message: "GPAI models must document model architecture (Annex XI)",
      article: "Annex XI",
    });
  }

  // Art. 53(1)(d) — Training data sources
  if (!card.trainingData.sources || card.trainingData.sources.length === 0) {
    issues.push({
      field: "trainingData.sources",
      severity: "error",
      message: "GPAI models must publish training data sources (Art. 53(1)(d))",
      article: "Art. 53(1)(d)",
    });
  }

  // Copyright compliance
  if (!card.trainingData.copyrightCompliance) {
    issues.push({
      field: "trainingData.copyrightCompliance",
      severity: "warning",
      message: "GPAI models should document copyright compliance policy (Art. 53(1)(c))",
      article: "Art. 53(1)(c)",
    });
  }

  // Computational resources (Annex XI)
  if (!card.computationalResources) {
    issues.push({
      field: "computationalResources",
      severity: "warning",
      message: "GPAI models should document computational resources used for training (Annex XI)",
      article: "Annex XI",
    });
  }

  // Evaluation — adversarial testing for systemic risk
  if (card.regulatoryInfo?.euAIActRiskLevel === "gpai") {
    if (!card.evaluation.adversarialTesting) {
      issues.push({
        field: "evaluation.adversarialTesting",
        severity: "warning",
        message: "GPAI models with systemic risk must document adversarial testing (Art. 55(1)(a))",
        article: "Art. 55(1)(a)",
      });
    }
  }
}
