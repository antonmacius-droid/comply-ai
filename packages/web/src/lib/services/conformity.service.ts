/**
 * Conformity Assessment Service
 *
 * Manages conformity assessment checklists for AI systems.
 * Uses checklists from @comply-ai/core (high-risk, limited-risk, gpai)
 * to build a trackable assessment with per-item status and evidence links.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import {
  getHighRiskChecklist,
  getLimitedRiskChecklist,
  getGPAIChecklist,
  type ChecklistItem,
  type Checklist,
  type RiskLevel,
} from "@comply-ai/core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Matches DB checklist_status enum: pending, compliant, non_compliant, na */
export type ChecklistItemStatus =
  | "pending"
  | "compliant"
  | "non_compliant"
  | "na";

export interface ConformityChecklistItem {
  /** Mirror of the core ChecklistItem.id (e.g. "HR-RMS-01") */
  itemId: string;
  requirement: string;
  article: string;
  description: string;
  mandatory: boolean;
  category: string;
  status: ChecklistItemStatus;
  notes: string;
  /** Evidence IDs linked to this item */
  linkedEvidenceIds: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface ConformityAssessment {
  id: string;
  systemId: string;
  riskLevel: RiskLevel;
  checklistTitle: string;
  items: ConformityChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ConformityProgress {
  assessmentId: string;
  totalItems: number;
  compliant: number;
  nonCompliant: number;
  inProgress: number;
  notStarted: number;
  notApplicable: number;
  overallPercentage: number;
  byArticle: Record<string, { total: number; compliant: number; percentage: number }>;
}

// ---------------------------------------------------------------------------
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const assessments: ConformityAssessment[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getChecklistForRiskLevel(
  riskLevel: RiskLevel,
  isSystemicRisk?: boolean
): Checklist {
  switch (riskLevel) {
    case "high":
      return getHighRiskChecklist();
    case "limited":
      return getLimitedRiskChecklist();
    case "gpai":
      return getGPAIChecklist(isSystemicRisk ?? false);
    default:
      // Minimal / prohibited — return high-risk as a baseline reference
      return getHighRiskChecklist();
  }
}

function coreItemToConformityItem(item: ChecklistItem): ConformityChecklistItem {
  return {
    itemId: item.id,
    requirement: item.requirement,
    article: item.article,
    description: item.description,
    mandatory: item.mandatory,
    category: item.category,
    status: "pending",
    notes: "",
    linkedEvidenceIds: [],
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function getOrCreateAssessment(
  systemId: string,
  riskLevel: RiskLevel = "high",
  isSystemicRisk?: boolean
): ConformityAssessment {
  // Return existing if one already exists for this system
  const existing = assessments.find((a) => a.systemId === systemId);
  if (existing) return existing;

  const checklist = getChecklistForRiskLevel(riskLevel, isSystemicRisk);
  const timestamp = now();

  const assessment: ConformityAssessment = {
    id: generateId(),
    systemId,
    riskLevel,
    checklistTitle: checklist.title,
    items: checklist.items.map(coreItemToConformityItem),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  assessments.push(assessment);
  return assessment;
}

export function getAssessment(id: string): ConformityAssessment | null {
  return assessments.find((a) => a.id === id) ?? null;
}

export function updateChecklistItem(
  assessmentId: string,
  itemId: string,
  status: ChecklistItemStatus,
  notes?: string,
  userId?: string
): ConformityAssessment | null {
  const idx = assessments.findIndex((a) => a.id === assessmentId);
  if (idx === -1) return null;

  const assessment = assessments[idx]!;
  const itemIdx = assessment.items.findIndex((i) => i.itemId === itemId);
  if (itemIdx === -1) {
    throw new Error(`Checklist item '${itemId}' not found in assessment`);
  }

  const timestamp = now();
  const updatedItems = [...assessment.items];
  updatedItems[itemIdx] = {
    ...updatedItems[itemIdx]!,
    status,
    notes: notes ?? updatedItems[itemIdx]!.notes,
    updatedAt: timestamp,
    updatedBy: userId,
  };

  const updated: ConformityAssessment = {
    ...assessment,
    items: updatedItems,
    updatedAt: timestamp,
  };

  assessments[idx] = updated;
  return updated;
}

export function linkEvidence(
  assessmentId: string,
  itemId: string,
  evidenceId: string
): ConformityAssessment | null {
  const idx = assessments.findIndex((a) => a.id === assessmentId);
  if (idx === -1) return null;

  const assessment = assessments[idx]!;
  const itemIdx = assessment.items.findIndex((i) => i.itemId === itemId);
  if (itemIdx === -1) {
    throw new Error(`Checklist item '${itemId}' not found in assessment`);
  }

  const item = assessment.items[itemIdx]!;

  // Don't duplicate links
  if (item.linkedEvidenceIds.includes(evidenceId)) {
    return assessment;
  }

  const timestamp = now();
  const updatedItems = [...assessment.items];
  updatedItems[itemIdx] = {
    ...item,
    linkedEvidenceIds: [...item.linkedEvidenceIds, evidenceId],
    updatedAt: timestamp,
  };

  const updated: ConformityAssessment = {
    ...assessment,
    items: updatedItems,
    updatedAt: timestamp,
  };

  assessments[idx] = updated;
  return updated;
}

export function getProgress(assessmentId: string): ConformityProgress | null {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) return null;

  const items = assessment.items;
  const totalItems = items.length;
  const compliant = items.filter((i) => i.status === "compliant").length;
  const nonCompliant = items.filter((i) => i.status === "non_compliant").length;
  const notStarted = items.filter((i) => i.status === "pending").length;
  const notApplicable = items.filter((i) => i.status === "na").length;

  // Calculate applicable items (excluding not_applicable)
  const applicableItems = totalItems - notApplicable;
  const overallPercentage =
    applicableItems > 0 ? Math.round((compliant / applicableItems) * 100) : 0;

  // Per-article breakdown
  const byArticle: ConformityProgress["byArticle"] = {};
  for (const item of items) {
    const article = item.article;
    if (!byArticle[article]) {
      byArticle[article] = { total: 0, compliant: 0, percentage: 0 };
    }
    if (item.status !== "na") {
      byArticle[article]!.total++;
      if (item.status === "compliant") {
        byArticle[article]!.compliant++;
      }
    }
  }

  // Calculate percentages per article
  for (const key of Object.keys(byArticle)) {
    const entry = byArticle[key]!;
    entry.percentage =
      entry.total > 0 ? Math.round((entry.compliant / entry.total) * 100) : 0;
  }

  return {
    assessmentId,
    totalItems,
    compliant,
    nonCompliant,
    inProgress: 0,
    notStarted,
    notApplicable,
    overallPercentage,
    byArticle,
  };
}
