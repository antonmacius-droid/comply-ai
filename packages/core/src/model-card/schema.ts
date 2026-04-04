/**
 * Model Card Schema — Zod schema for EU AI Act compliant model cards
 *
 * Based on the requirements from Annex IV (Technical Documentation),
 * Annex XI (GPAI technical documentation), and Article 13 (Transparency).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const ModelIdentificationSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  version: z.string().min(1, "Version is required"),
  provider: z.string().min(1, "Provider name is required"),
  providerContact: z.string().optional(),
  releaseDate: z.string().optional(),
  modelType: z.string().optional(),
  architecture: z.string().optional(),
  parameterCount: z.number().optional(),
  license: z.string().optional(),
});

export const IntendedUseSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  intendedUsers: z.array(z.string()).min(1, "At least one intended user group is required"),
  intendedDomains: z.array(z.string()).optional(),
  outOfScopeUses: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
});

export const TrainingDataSchema = z.object({
  description: z.string().min(1, "Training data description is required"),
  sources: z.array(z.string()).optional(),
  size: z.string().optional(),
  preprocessing: z.string().optional(),
  dataGovernance: z.string().optional(),
  knownBiases: z.array(z.string()).optional(),
  personalDataProcessed: z.boolean().optional(),
  personalDataCategories: z.array(z.string()).optional(),
  copyrightCompliance: z.string().optional(),
});

export const EvaluationMetricSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  description: z.string().optional(),
  dataset: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const EvaluationResultsSchema = z.object({
  metrics: z.array(EvaluationMetricSchema).min(1, "At least one evaluation metric is required"),
  testingMethodology: z.string().optional(),
  adversarialTesting: z.string().optional(),
  fairnessEvaluation: z.string().optional(),
  limitations: z.array(z.string()).optional(),
  knownFailureModes: z.array(z.string()).optional(),
});

export const ComputationalResourcesSchema = z.object({
  trainingCompute: z.string().optional(),
  trainingComputeFlops: z.number().optional(),
  trainingDuration: z.string().optional(),
  hardware: z.string().optional(),
  energyConsumption: z.string().optional(),
  carbonFootprint: z.string().optional(),
});

export const RiskMitigationSchema = z.object({
  identifiedRisks: z.array(z.string()),
  mitigationMeasures: z.array(z.string()),
  residualRisks: z.array(z.string()).optional(),
  humanOversightMeasures: z.string().optional(),
});

export const RegulatoryInfoSchema = z.object({
  euAIActRiskLevel: z.enum(["prohibited", "high", "limited", "minimal", "gpai"]).optional(),
  annexIIICategory: z.string().optional(),
  conformityAssessment: z.string().optional(),
  ceMarking: z.boolean().optional(),
  euDatabaseRegistration: z.string().optional(),
  applicableArticles: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Main model card schema
// ---------------------------------------------------------------------------

export const ModelCardSchema = z.object({
  /** Schema version */
  schemaVersion: z.literal("1.0"),

  /** Model identification and metadata */
  identification: ModelIdentificationSchema,

  /** Intended use and scope */
  intendedUse: IntendedUseSchema,

  /** Training data information */
  trainingData: TrainingDataSchema,

  /** Evaluation and performance metrics */
  evaluation: EvaluationResultsSchema,

  /** Computational resources used */
  computationalResources: ComputationalResourcesSchema.optional(),

  /** Risks and mitigation */
  riskMitigation: RiskMitigationSchema.optional(),

  /** EU AI Act regulatory information */
  regulatoryInfo: RegulatoryInfoSchema.optional(),

  /** Ethical considerations */
  ethicalConsiderations: z.string().optional(),

  /** Additional notes */
  additionalNotes: z.string().optional(),

  /** When the model card was generated */
  generatedAt: z.string().optional(),
});

export type ModelCard = z.infer<typeof ModelCardSchema>;
export type ModelIdentification = z.infer<typeof ModelIdentificationSchema>;
export type IntendedUse = z.infer<typeof IntendedUseSchema>;
export type TrainingData = z.infer<typeof TrainingDataSchema>;
export type EvaluationMetric = z.infer<typeof EvaluationMetricSchema>;
export type EvaluationResults = z.infer<typeof EvaluationResultsSchema>;
export type ComputationalResources = z.infer<typeof ComputationalResourcesSchema>;
export type RiskMitigation = z.infer<typeof RiskMitigationSchema>;
export type RegulatoryInfo = z.infer<typeof RegulatoryInfoSchema>;
