/**
 * Risk Assessment Service
 *
 * Manages risk assessments for AI systems using the core classifyRisk() engine.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import {
  classifyRisk,
  type ClassificationInput,
  type ClassificationResult,
  type RiskLevel,
  type ProhibitedPractice,
} from "@comply-ai/core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssessmentStatus = "draft" | "submitted" | "approved" | "rejected";

export interface RiskAssessment {
  id: string;
  systemId: string;
  status: AssessmentStatus;
  input: ClassificationInput;
  result: ClassificationResult;
  riskLevel: RiskLevel;
  confidence: number;
  rationale: string[];
  prohibitedPractices: ProhibitedPractice[];
  applicableArticles: string[];
  requirements: string[];
  warnings: string[];
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentInput {
  name: string;
  description: string;
  purpose: string;
  category?: ClassificationInput["category"];
  isGeneralPurpose?: boolean;
  usesRealTimeBiometrics?: boolean;
  targetsDomain?: string;
  affectsVulnerableGroups?: boolean;
  makesAutonomousDecisions?: boolean;
  processesPersonalData?: boolean;
  isChatbot?: boolean;
  generatesDeepfakes?: boolean;
  interactsWithPersons?: boolean;
  isSafetyComponent?: boolean;
  trainingComputeFlops?: number;
  euRegisteredUsers?: number;
  performsSocialScoring?: boolean;
  usesSubliminalTechniques?: boolean;
  categorisesBySensitiveBiometrics?: boolean;
  scrapesFacialImages?: boolean;
  infersEmotionsAtWork?: boolean;
  predictsCrimeBySoleProfiling?: boolean;
  hasLawEnforcementExemption?: boolean;
}

// ---------------------------------------------------------------------------
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const assessments: RiskAssessment[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function createAssessment(
  systemId: string,
  input: CreateAssessmentInput
): RiskAssessment {
  const classificationInput: ClassificationInput = {
    name: input.name,
    description: input.description,
    purpose: input.purpose,
    category: input.category,
    isGeneralPurpose: input.isGeneralPurpose,
    usesRealTimeBiometrics: input.usesRealTimeBiometrics,
    targetsDomain: input.targetsDomain,
    affectsVulnerableGroups: input.affectsVulnerableGroups,
    makesAutonomousDecisions: input.makesAutonomousDecisions,
    processesPersonalData: input.processesPersonalData,
    isChatbot: input.isChatbot,
    generatesDeepfakes: input.generatesDeepfakes,
    interactsWithPersons: input.interactsWithPersons,
    isSafetyComponent: input.isSafetyComponent,
    trainingComputeFlops: input.trainingComputeFlops,
    euRegisteredUsers: input.euRegisteredUsers,
    performsSocialScoring: input.performsSocialScoring,
    usesSubliminalTechniques: input.usesSubliminalTechniques,
    categorisesBySensitiveBiometrics: input.categorisesBySensitiveBiometrics,
    scrapesFacialImages: input.scrapesFacialImages,
    infersEmotionsAtWork: input.infersEmotionsAtWork,
    predictsCrimeBySoleProfiling: input.predictsCrimeBySoleProfiling,
    hasLawEnforcementExemption: input.hasLawEnforcementExemption,
  };

  const result = classifyRisk(classificationInput);
  const timestamp = now();

  const assessment: RiskAssessment = {
    id: generateId(),
    systemId,
    status: "draft",
    input: classificationInput,
    result,
    riskLevel: result.riskLevel,
    confidence: result.confidence,
    rationale: result.rationale,
    prohibitedPractices: result.prohibitedPractices,
    applicableArticles: result.applicableArticles,
    requirements: result.requirements,
    warnings: result.warnings,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  assessments.push(assessment);
  return assessment;
}

export function getAssessment(id: string): RiskAssessment | null {
  return assessments.find((a) => a.id === id) ?? null;
}

export function listAssessments(systemId?: string): RiskAssessment[] {
  const result = systemId
    ? assessments.filter((a) => a.systemId === systemId)
    : [...assessments];

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function submitAssessment(id: string): RiskAssessment | null {
  const idx = assessments.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const existing = assessments[idx]!;
  if (existing.status !== "draft") {
    throw new Error(`Cannot submit assessment in '${existing.status}' status — must be 'draft'`);
  }

  const updated: RiskAssessment = {
    ...existing,
    status: "submitted",
    submittedAt: now(),
    updatedAt: now(),
  };

  assessments[idx] = updated;
  return updated;
}

export function approveAssessment(
  id: string,
  approverId: string
): RiskAssessment | null {
  const idx = assessments.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const existing = assessments[idx]!;
  if (existing.status !== "submitted") {
    throw new Error(
      `Cannot approve assessment in '${existing.status}' status — must be 'submitted'`
    );
  }

  const updated: RiskAssessment = {
    ...existing,
    status: "approved",
    approvedBy: approverId,
    approvedAt: now(),
    updatedAt: now(),
  };

  assessments[idx] = updated;
  return updated;
}
