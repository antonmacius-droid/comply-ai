/**
 * Model Card Generator — Generate EU AI Act compliant model cards
 *
 * Produces structured model card JSON conforming to the requirements
 * of Annex IV, Annex XI, and Article 13 of the EU AI Act.
 */

import type { ModelCard, EvaluationMetric } from "./schema.js";
import type { RiskLevel, AnnexIIICategory } from "../types/eu-ai-act.js";

// ---------------------------------------------------------------------------
// Input interface
// ---------------------------------------------------------------------------

export interface ModelCardInput {
  // Identification
  name: string;
  version: string;
  provider: string;
  providerContact?: string;
  releaseDate?: string;
  modelType?: string;
  architecture?: string;
  parameterCount?: number;
  license?: string;

  // Intended use
  purpose: string;
  intendedUsers: string[];
  intendedDomains?: string[];
  outOfScopeUses?: string[];
  restrictions?: string[];

  // Training data
  trainingDataDescription: string;
  trainingDataSources?: string[];
  trainingDataSize?: string;
  preprocessing?: string;
  dataGovernance?: string;
  knownBiases?: string[];
  personalDataProcessed?: boolean;
  personalDataCategories?: string[];
  copyrightCompliance?: string;

  // Evaluation
  metrics: EvaluationMetric[];
  testingMethodology?: string;
  adversarialTesting?: string;
  fairnessEvaluation?: string;
  limitations?: string[];
  knownFailureModes?: string[];

  // Computational resources
  trainingCompute?: string;
  trainingComputeFlops?: number;
  trainingDuration?: string;
  hardware?: string;
  energyConsumption?: string;
  carbonFootprint?: string;

  // Risk
  identifiedRisks?: string[];
  mitigationMeasures?: string[];
  residualRisks?: string[];
  humanOversightMeasures?: string;

  // Regulatory
  riskLevel?: RiskLevel;
  annexIIICategory?: AnnexIIICategory;
  conformityAssessment?: string;
  ceMarking?: boolean;
  euDatabaseRegistration?: string;
  applicableArticles?: string[];

  // Misc
  ethicalConsiderations?: string;
  additionalNotes?: string;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a structured model card JSON object from the given input.
 */
export function generateModelCard(input: ModelCardInput): ModelCard {
  const now = new Date().toISOString();

  const card: ModelCard = {
    schemaVersion: "1.0",

    identification: {
      name: input.name,
      version: input.version,
      provider: input.provider,
      providerContact: input.providerContact,
      releaseDate: input.releaseDate,
      modelType: input.modelType,
      architecture: input.architecture,
      parameterCount: input.parameterCount,
      license: input.license,
    },

    intendedUse: {
      purpose: input.purpose,
      intendedUsers: input.intendedUsers,
      intendedDomains: input.intendedDomains,
      outOfScopeUses: input.outOfScopeUses,
      restrictions: input.restrictions,
    },

    trainingData: {
      description: input.trainingDataDescription,
      sources: input.trainingDataSources,
      size: input.trainingDataSize,
      preprocessing: input.preprocessing,
      dataGovernance: input.dataGovernance,
      knownBiases: input.knownBiases,
      personalDataProcessed: input.personalDataProcessed,
      personalDataCategories: input.personalDataCategories,
      copyrightCompliance: input.copyrightCompliance,
    },

    evaluation: {
      metrics: input.metrics,
      testingMethodology: input.testingMethodology,
      adversarialTesting: input.adversarialTesting,
      fairnessEvaluation: input.fairnessEvaluation,
      limitations: input.limitations,
      knownFailureModes: input.knownFailureModes,
    },

    generatedAt: now,
  };

  // Optional sections — only include if data provided
  if (
    input.trainingCompute ||
    input.trainingComputeFlops ||
    input.trainingDuration ||
    input.hardware ||
    input.energyConsumption ||
    input.carbonFootprint
  ) {
    card.computationalResources = {
      trainingCompute: input.trainingCompute,
      trainingComputeFlops: input.trainingComputeFlops,
      trainingDuration: input.trainingDuration,
      hardware: input.hardware,
      energyConsumption: input.energyConsumption,
      carbonFootprint: input.carbonFootprint,
    };
  }

  if (
    (input.identifiedRisks && input.identifiedRisks.length > 0) ||
    (input.mitigationMeasures && input.mitigationMeasures.length > 0)
  ) {
    card.riskMitigation = {
      identifiedRisks: input.identifiedRisks ?? [],
      mitigationMeasures: input.mitigationMeasures ?? [],
      residualRisks: input.residualRisks,
      humanOversightMeasures: input.humanOversightMeasures,
    };
  }

  if (
    input.riskLevel ||
    input.annexIIICategory ||
    input.conformityAssessment ||
    input.ceMarking !== undefined ||
    input.euDatabaseRegistration ||
    (input.applicableArticles && input.applicableArticles.length > 0)
  ) {
    card.regulatoryInfo = {
      euAIActRiskLevel: input.riskLevel,
      annexIIICategory: input.annexIIICategory,
      conformityAssessment: input.conformityAssessment,
      ceMarking: input.ceMarking,
      euDatabaseRegistration: input.euDatabaseRegistration,
      applicableArticles: input.applicableArticles,
    };
  }

  if (input.ethicalConsiderations) {
    card.ethicalConsiderations = input.ethicalConsiderations;
  }

  if (input.additionalNotes) {
    card.additionalNotes = input.additionalNotes;
  }

  return card;
}
