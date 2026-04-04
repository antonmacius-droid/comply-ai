/**
 * Incident Management Service
 *
 * Manages incident records for AI systems per Article 62/73 of the EU AI Act.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import type { IncidentSeverity } from "@comply-ai/core";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";

export interface Incident {
  id: string;
  systemId: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  /** Whether the national authority has been notified */
  notifiedAuthority: boolean;
  /** Whether notification was made within 72 hours (Art. 62 requirement) */
  notifiedWithin72Hours?: boolean;
  notifiedAt?: string;
  /** Affected users count */
  affectedUsers?: number;
  /** Root cause analysis */
  rootCause?: string;
  /** Resolution details */
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  /** Corrective actions taken */
  correctiveActions: string[];
  /** Preventive measures for the future */
  preventiveMeasures?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentInput {
  severity: IncidentSeverity;
  title: string;
  description: string;
  reportedBy: string;
  affectedUsers?: number;
}

export interface UpdateIncidentInput {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  title?: string;
  description?: string;
  notifiedAuthority?: boolean;
  notifiedWithin72Hours?: boolean;
  notifiedAt?: string;
  affectedUsers?: number;
  rootCause?: string;
  resolution?: string;
  resolvedBy?: string;
  correctiveActions?: string[];
  preventiveMeasures?: string;
}

// ---------------------------------------------------------------------------
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const incidents: Incident[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function createIncident(
  systemId: string,
  data: CreateIncidentInput
): Incident {
  const timestamp = now();

  const incident: Incident = {
    id: generateId(),
    systemId,
    severity: data.severity,
    status: "open",
    title: data.title,
    description: data.description,
    reportedBy: data.reportedBy,
    reportedAt: timestamp,
    notifiedAuthority: false,
    affectedUsers: data.affectedUsers,
    correctiveActions: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  incidents.push(incident);
  return incident;
}

export function getIncident(id: string): Incident | null {
  return incidents.find((i) => i.id === id) ?? null;
}

export function listIncidents(systemId?: string): Incident[] {
  const result = systemId
    ? incidents.filter((i) => i.systemId === systemId)
    : [...incidents];

  return result.sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );
}

export function updateIncident(
  id: string,
  data: UpdateIncidentInput
): Incident | null {
  const idx = incidents.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  const existing = incidents[idx]!;
  const timestamp = now();

  // If status is being set to resolved, set resolvedAt
  const resolvedAt =
    data.status === "resolved" && existing.status !== "resolved"
      ? timestamp
      : existing.resolvedAt;

  const updated: Incident = {
    ...existing,
    severity: data.severity ?? existing.severity,
    status: data.status ?? existing.status,
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    notifiedAuthority: data.notifiedAuthority ?? existing.notifiedAuthority,
    notifiedWithin72Hours:
      data.notifiedWithin72Hours ?? existing.notifiedWithin72Hours,
    notifiedAt: data.notifiedAt ?? existing.notifiedAt,
    affectedUsers: data.affectedUsers ?? existing.affectedUsers,
    rootCause: data.rootCause ?? existing.rootCause,
    resolution: data.resolution ?? existing.resolution,
    resolvedAt,
    resolvedBy: data.resolvedBy ?? existing.resolvedBy,
    correctiveActions: data.correctiveActions ?? existing.correctiveActions,
    preventiveMeasures: data.preventiveMeasures ?? existing.preventiveMeasures,
    updatedAt: timestamp,
  };

  incidents[idx] = updated;
  return updated;
}
