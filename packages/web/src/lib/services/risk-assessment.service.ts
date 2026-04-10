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
import { eq, and, desc } from "drizzle-orm";
import { db, isDbConnected } from "@/lib/db";
import { riskAssessments as raTable } from "@/lib/db/schema";

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
// In-memory store (fallback when Postgres is not connected)
// ---------------------------------------------------------------------------

const assessments: RiskAssessment[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// DB ↔ Service type mapping helpers
// ---------------------------------------------------------------------------

type DbAssessmentRow = typeof raTable.$inferSelect;

function dbRowToAssessment(row: DbAssessmentRow): RiskAssessment {
  const scores = (row.scores ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    systemId: row.systemId,
    status: row.status as AssessmentStatus,
    input: (scores.input as ClassificationInput) ?? ({} as ClassificationInput),
    result: (scores.result as ClassificationResult) ?? ({} as ClassificationResult),
    riskLevel: row.riskLevel as RiskLevel,
    confidence: (scores.confidence as number) ?? 0,
    rationale: ((scores.rationale as string[]) ?? []),
    prohibitedPractices: ((scores.prohibitedPractices as ProhibitedPractice[]) ?? []),
    applicableArticles: ((scores.applicableArticles as string[]) ?? []),
    requirements: ((scores.requirements as string[]) ?? []),
    warnings: ((scores.warnings as string[]) ?? []),
    submittedAt: (scores.submittedAt as string) ?? undefined,
    approvedBy: (scores.approvedBy as string) ?? undefined,
    approvedAt: (scores.approvedAt as string) ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(), // DB has no updatedAt, use createdAt
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function createAssessment(
  systemId: string,
  input: CreateAssessmentInput
): Promise<RiskAssessment> {
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

  // Always run the core classification engine
  const result = classifyRisk(classificationInput);

  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const scores = {
      input: classificationInput,
      result,
      confidence: result.confidence,
      rationale: result.rationale,
      prohibitedPractices: result.prohibitedPractices,
      applicableArticles: result.applicableArticles,
      requirements: result.requirements,
      warnings: result.warnings,
    };

    const [row] = await db
      .insert(raTable)
      .values({
        systemId,
        riskLevel: result.riskLevel as "unacceptable" | "high" | "limited" | "minimal" | "gpai",
        annexIiiCategory: classificationInput.category ?? null,
        scores,
        status: "draft",
      })
      .returning();

    return dbRowToAssessment(row!);
  }

  // ── In-memory fallback ──
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

export async function getAssessment(id: string): Promise<RiskAssessment | null> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const row = await db.query.riskAssessments.findFirst({
      where: eq(raTable.id, id),
    });
    return row ? dbRowToAssessment(row) : null;
  }

  // ── In-memory fallback ──
  return assessments.find((a) => a.id === id) ?? null;
}

export async function listAssessments(systemId?: string): Promise<RiskAssessment[]> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const conditions = systemId ? [eq(raTable.systemId, systemId)] : [];
    const rows = await db
      .select()
      .from(raTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(raTable.createdAt));
    return rows.map(dbRowToAssessment);
  }

  // ── In-memory fallback ──
  const result = systemId
    ? assessments.filter((a) => a.systemId === systemId)
    : [...assessments];

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function submitAssessment(id: string): Promise<RiskAssessment | null> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const existing = await db.query.riskAssessments.findFirst({
      where: eq(raTable.id, id),
    });
    if (!existing) return null;
    if (existing.status !== "draft") {
      throw new Error(`Cannot submit assessment in '${existing.status}' status — must be 'draft'`);
    }

    const oldScores = (existing.scores ?? {}) as Record<string, unknown>;
    const [row] = await db
      .update(raTable)
      .set({
        status: "submitted",
        scores: { ...oldScores, submittedAt: now() },
      })
      .where(eq(raTable.id, id))
      .returning();

    return row ? dbRowToAssessment(row) : null;
  }

  // ── In-memory fallback ──
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

export async function approveAssessment(
  id: string,
  approverId: string
): Promise<RiskAssessment | null> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const existing = await db.query.riskAssessments.findFirst({
      where: eq(raTable.id, id),
    });
    if (!existing) return null;
    if (existing.status !== "submitted") {
      throw new Error(
        `Cannot approve assessment in '${existing.status}' status — must be 'submitted'`
      );
    }

    const oldScores = (existing.scores ?? {}) as Record<string, unknown>;
    const [row] = await db
      .update(raTable)
      .set({
        status: "approved",
        assessorId: approverId,
        scores: { ...oldScores, approvedBy: approverId, approvedAt: now() },
      })
      .where(eq(raTable.id, id))
      .returning();

    return row ? dbRowToAssessment(row) : null;
  }

  // ── In-memory fallback ──
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
