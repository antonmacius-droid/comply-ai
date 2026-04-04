/**
 * Evidence Management Service
 *
 * Manages evidence records that support compliance assessments.
 * Evidence can be linked to risk assessments and conformity checklist items.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import type { EvidenceType } from "@comply-ai/core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Evidence {
  id: string;
  systemId: string;
  type: EvidenceType;
  title: string;
  description: string;
  fileName?: string;
  fileUrl?: string;
  fileHash?: string;
  fileSizeBytes?: number;
  uploadedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  expiresAt?: string;
  metadata: Record<string, unknown>;
  /** IDs of assessments this evidence is linked to */
  linkedAssessmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadEvidenceInput {
  type: EvidenceType;
  title: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  fileHash?: string;
  fileSizeBytes?: number;
  uploadedBy: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const evidenceStore: Evidence[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function uploadEvidence(
  systemId: string,
  input: UploadEvidenceInput
): Evidence {
  const timestamp = now();

  const evidence: Evidence = {
    id: generateId(),
    systemId,
    type: input.type,
    title: input.title,
    description: input.description ?? "",
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    fileHash: input.fileHash,
    fileSizeBytes: input.fileSizeBytes,
    uploadedBy: input.uploadedBy,
    verified: false,
    expiresAt: input.expiresAt,
    metadata: input.metadata ?? {},
    linkedAssessmentIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  evidenceStore.push(evidence);
  return evidence;
}

export function getEvidence(id: string): Evidence | null {
  return evidenceStore.find((e) => e.id === id) ?? null;
}

export function listEvidence(systemId?: string): Evidence[] {
  const result = systemId
    ? evidenceStore.filter((e) => e.systemId === systemId)
    : [...evidenceStore];

  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function linkToAssessment(
  evidenceId: string,
  assessmentId: string
): Evidence | null {
  const idx = evidenceStore.findIndex((e) => e.id === evidenceId);
  if (idx === -1) return null;

  const existing = evidenceStore[idx]!;

  // Don't duplicate links
  if (existing.linkedAssessmentIds.includes(assessmentId)) {
    return existing;
  }

  const updated: Evidence = {
    ...existing,
    linkedAssessmentIds: [...existing.linkedAssessmentIds, assessmentId],
    updatedAt: now(),
  };

  evidenceStore[idx] = updated;
  return updated;
}

export function verifyEvidence(
  id: string,
  verifiedBy: string
): Evidence | null {
  const idx = evidenceStore.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const timestamp = now();
  const updated: Evidence = {
    ...evidenceStore[idx]!,
    verified: true,
    verifiedBy,
    verifiedAt: timestamp,
    updatedAt: timestamp,
  };

  evidenceStore[idx] = updated;
  return updated;
}

export function deleteEvidence(id: string): boolean {
  const idx = evidenceStore.findIndex((e) => e.id === id);
  if (idx === -1) return false;

  evidenceStore.splice(idx, 1);
  return true;
}
