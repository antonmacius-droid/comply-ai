/**
 * @comply-ai/core — EU AI Act compliance engine
 *
 * Pure logic, no database, no network.
 * MIT licensed, usable standalone via npm.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  RiskLevel,
  AnnexIIICategory,
  ProhibitedPractice,
  SystemStatus,
  DocumentType,
  EvidenceType,
  GPAITier,
  ConformityAssessmentType,
  IncidentSeverity,
  AISystemMetadata,
  RiskAssessmentResult,
  ComplianceDocument,
  IncidentRecord,
} from "./types/eu-ai-act.js";

// ---------------------------------------------------------------------------
// Classifier
// ---------------------------------------------------------------------------

export { classifyRisk } from "./classifier/risk-classifier.js";
export type {
  ClassificationInput,
  ClassificationResult,
} from "./classifier/risk-classifier.js";

export { checkProhibitedPractices } from "./classifier/prohibited-checks.js";
export type {
  ProhibitedCheckInput,
  ProhibitedCheckResult,
  DetectedProhibitedPractice,
} from "./classifier/prohibited-checks.js";

export {
  ANNEX_III_DEFINITIONS,
  getAnnexIIIDefinition,
  matchAnnexIIIByKeywords,
} from "./classifier/annex-iii.js";
export type {
  AnnexIIICategoryDefinition,
  AnnexIIISubcategory,
} from "./classifier/annex-iii.js";

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

export {
  getHighRiskChecklist,
  getHighRiskChecklistByCategory,
  getHighRiskCategories,
} from "./checklist/high-risk.js";

export {
  getLimitedRiskChecklist,
  getMandatoryTransparencyItems,
} from "./checklist/limited-risk.js";

export {
  getGPAIChecklist,
  getSystemicRiskItems,
} from "./checklist/gpai.js";

export type { ChecklistItem, Checklist } from "./checklist/types.js";

// ---------------------------------------------------------------------------
// Model Card
// ---------------------------------------------------------------------------

export { generateModelCard } from "./model-card/generator.js";
export type { ModelCardInput } from "./model-card/generator.js";

export { validateModelCard } from "./model-card/validator.js";
export type {
  ValidationResult,
  ValidationIssue,
} from "./model-card/validator.js";

export { ModelCardSchema } from "./model-card/schema.js";
export type {
  ModelCard,
  ModelIdentification,
  IntendedUse,
  TrainingData,
  EvaluationMetric,
  EvaluationResults,
  ComputationalResources,
  RiskMitigation,
  RegulatoryInfo,
} from "./model-card/schema.js";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export {
  AISystemSchema,
  RiskLevelSchema,
  AnnexIIICategorySchema,
  SystemStatusSchema,
  GPAITierSchema,
} from "./schemas/ai-system.js";

export {
  RiskAssessmentSchema,
  ProhibitedPracticeSchema,
} from "./schemas/risk-assessment.js";

export { EvidenceSchema, EvidenceTypeSchema } from "./schemas/evidence.js";

export {
  IncidentSchema,
  IncidentSeveritySchema,
} from "./schemas/incident.js";

export {
  ComplianceDocumentSchema,
  DocumentTypeSchema,
  DocumentStatusSchema,
} from "./schemas/document.js";
