/**
 * Incident Management Service
 *
 * Manages incident records for AI systems per Article 62/73 of the EU AI Act.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import type { IncidentSeverity } from "@comply-ai/core";
import { eq, and, desc } from "drizzle-orm";
import { db, isDbConnected } from "@/lib/db";
import { incidents as incidentsTable } from "@/lib/db/schema";

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
// In-memory store (fallback when Postgres is not connected)
// ---------------------------------------------------------------------------

const incidents: Incident[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// DB ↔ Service type mapping helpers
// ---------------------------------------------------------------------------

type DbIncidentRow = typeof incidentsTable.$inferSelect;

/**
 * The DB schema stores a subset of incident fields as columns.
 * Extra service-level fields (reportedBy, notifiedAuthority, rootCause,
 * resolution, correctiveActions, preventiveMeasures, etc.) are not in the DB
 * schema, so we round-trip them via a hypothetical metadata JSONB extension.
 * For now we store/read them from a `metadata` field pattern — but the
 * incidents table doesn't have a metadata column, so we embed these extras
 * into the row as best-effort and keep the in-memory store as canonical
 * for fields the DB can't hold.
 *
 * Fields that map directly:
 *   id, systemId, severity, status, title, description,
 *   detectedAt→createdAt, reportedAt, resolvedAt, createdAt
 */
function dbRowToIncident(row: DbIncidentRow): Incident {
  return {
    id: row.id,
    systemId: row.systemId,
    severity: row.severity as IncidentSeverity,
    status: row.status as IncidentStatus,
    title: row.title,
    description: row.description ?? "",
    reportedBy: row.reporterId ?? "unknown",
    reportedAt: row.reportedAt?.toISOString() ?? row.createdAt.toISOString(),
    notifiedAuthority: false,
    affectedUsers: undefined,
    correctiveActions: [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function createIncident(
  systemId: string,
  data: CreateIncidentInput
): Promise<Incident> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const [row] = await db
      .insert(incidentsTable)
      .values({
        systemId,
        orgId: "00000000-0000-0000-0000-000000000000", // TODO: pass orgId through when available
        severity: data.severity as "critical" | "high" | "medium" | "low",
        title: data.title,
        description: data.description,
        status: "open",
        reportedAt: new Date(),
        reporterId: null,
      })
      .returning();

    const incident = dbRowToIncident(row!);
    // Enrich with fields the DB doesn't store
    incident.reportedBy = data.reportedBy;
    incident.affectedUsers = data.affectedUsers;
    return incident;
  }

  // ── In-memory fallback ──
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

export async function getIncident(id: string): Promise<Incident | null> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const row = await db.query.incidents.findFirst({
      where: eq(incidentsTable.id, id),
    });
    return row ? dbRowToIncident(row) : null;
  }

  // ── In-memory fallback ──
  return incidents.find((i) => i.id === id) ?? null;
}

export async function listIncidents(systemId?: string): Promise<Incident[]> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const conditions = systemId ? [eq(incidentsTable.systemId, systemId)] : [];
    const rows = await db
      .select()
      .from(incidentsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(incidentsTable.createdAt));
    return rows.map(dbRowToIncident);
  }

  // ── In-memory fallback ──
  const result = systemId
    ? incidents.filter((i) => i.systemId === systemId)
    : [...incidents];

  return result.sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );
}

export async function updateIncident(
  id: string,
  data: UpdateIncidentInput
): Promise<Incident | null> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const existing = await db.query.incidents.findFirst({
      where: eq(incidentsTable.id, id),
    });
    if (!existing) return null;

    const setValues: Record<string, unknown> = {};
    if (data.severity !== undefined) setValues.severity = data.severity;
    if (data.status !== undefined) setValues.status = data.status;
    if (data.title !== undefined) setValues.title = data.title;
    if (data.description !== undefined) setValues.description = data.description;

    // Handle resolvedAt
    if (data.status === "resolved" && existing.status !== "resolved") {
      setValues.resolvedAt = new Date();
    }
    if (data.notifiedAt !== undefined) {
      setValues.reportedAt = new Date(data.notifiedAt);
    }

    const [row] = await db
      .update(incidentsTable)
      .set(setValues)
      .where(eq(incidentsTable.id, id))
      .returning();

    if (!row) return null;

    // Enrich with fields not in DB
    const incident = dbRowToIncident(row);
    incident.notifiedAuthority = data.notifiedAuthority ?? false;
    incident.notifiedWithin72Hours = data.notifiedWithin72Hours;
    incident.notifiedAt = data.notifiedAt;
    incident.rootCause = data.rootCause;
    incident.resolution = data.resolution;
    incident.resolvedBy = data.resolvedBy;
    incident.correctiveActions = data.correctiveActions ?? [];
    incident.preventiveMeasures = data.preventiveMeasures;
    incident.affectedUsers = data.affectedUsers;
    return incident;
  }

  // ── In-memory fallback ──
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

// ---------------------------------------------------------------------------
// Incident timeline events
// ---------------------------------------------------------------------------

export interface IncidentTimelineEvent {
  id: string;
  incidentId: string;
  type: "created" | "updated" | "escalated" | "resolved" | "closed" | "comment";
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const timelineEvents: IncidentTimelineEvent[] = [];

function addTimelineEvent(
  incidentId: string,
  type: IncidentTimelineEvent["type"],
  description: string,
  actor: string,
  metadata?: Record<string, unknown>
): IncidentTimelineEvent {
  const event: IncidentTimelineEvent = {
    id: generateId(),
    incidentId,
    type,
    description,
    actor,
    timestamp: now(),
    metadata,
  };
  timelineEvents.push(event);
  return event;
}

// ---------------------------------------------------------------------------
// Enhanced service functions (Phase 4)
// ---------------------------------------------------------------------------

/**
 * Escalate an incident — marks it for national authority notification (Art. 62).
 * Sets notifiedAuthority to true and calculates if within 72-hour window.
 */
export async function escalateIncident(
  id: string,
  escalatedBy: string = "system"
): Promise<Incident | null> {
  const incident = await getIncident(id);
  if (!incident) return null;

  const notifiedAt = now();
  const reportedTime = new Date(incident.reportedAt).getTime();
  const notifiedTime = new Date(notifiedAt).getTime();
  const hoursDiff = (notifiedTime - reportedTime) / (1000 * 60 * 60);
  const within72Hours = hoursDiff <= 72;

  const updated = await updateIncident(id, {
    notifiedAuthority: true,
    notifiedAt,
    notifiedWithin72Hours: within72Hours,
    status: incident.status === "open" ? "investigating" : undefined,
  });

  if (updated) {
    addTimelineEvent(
      id,
      "escalated",
      `Incident escalated to national authority per Article 62. ` +
        `Notification ${within72Hours ? "within" : "PAST"} 72-hour deadline ` +
        `(${hoursDiff.toFixed(1)} hours after detection).`,
      escalatedBy,
      { notifiedAt, within72Hours, hoursElapsed: parseFloat(hoursDiff.toFixed(1)) }
    );
  }

  return updated;
}

/**
 * Get the full chronological timeline for an incident.
 */
export async function getIncidentTimeline(
  incidentId: string
): Promise<IncidentTimelineEvent[]> {
  // Always include a "created" event based on the incident itself
  const incident = await getIncident(incidentId);
  if (!incident) return [];

  const stored = timelineEvents.filter(
    (e) => e.incidentId === incidentId
  );

  // Build synthetic events from incident state if no stored events exist
  const events: IncidentTimelineEvent[] = [
    {
      id: `${incidentId}_created`,
      incidentId,
      type: "created",
      description: `Incident reported: ${incident.title}`,
      actor: incident.reportedBy,
      timestamp: incident.createdAt,
    },
    ...stored,
  ];

  if (incident.notifiedAuthority && incident.notifiedAt) {
    const alreadyHasEscalation = stored.some((e) => e.type === "escalated");
    if (!alreadyHasEscalation) {
      events.push({
        id: `${incidentId}_escalated`,
        incidentId,
        type: "escalated",
        description: "Escalated to national authority per Article 62",
        actor: "system",
        timestamp: incident.notifiedAt,
      });
    }
  }

  if (incident.status === "resolved" && incident.resolvedAt) {
    const alreadyHasResolution = stored.some((e) => e.type === "resolved");
    if (!alreadyHasResolution) {
      events.push({
        id: `${incidentId}_resolved`,
        incidentId,
        type: "resolved",
        description: incident.resolution || "Incident resolved",
        actor: incident.resolvedBy || "unknown",
        timestamp: incident.resolvedAt,
      });
    }
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Calculate the notification deadline for an incident (72 hours from detection).
 */
export function calculateNotificationDeadline(
  incident: Incident
): { deadline: string; hoursRemaining: number; isOverdue: boolean } {
  const reportedTime = new Date(incident.reportedAt).getTime();
  const deadlineTime = reportedTime + 72 * 60 * 60 * 1000;
  const deadline = new Date(deadlineTime).toISOString();
  const nowTime = Date.now();
  const hoursRemaining = Math.max(
    0,
    (deadlineTime - nowTime) / (1000 * 60 * 60)
  );
  const isOverdue = nowTime > deadlineTime;

  return { deadline, hoursRemaining: parseFloat(hoursRemaining.toFixed(1)), isOverdue };
}

/**
 * Get all incidents that are past their 72-hour notification deadline
 * and have NOT been notified to the authority.
 */
export async function getOverdueIncidents(): Promise<Incident[]> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const rows = await db
      .select()
      .from(incidentsTable)
      .where(
        and(
          eq(incidentsTable.status, "open"),
        )
      );
    return rows
      .map(dbRowToIncident)
      .filter((incident) => {
        if (incident.notifiedAuthority) return false;
        const { isOverdue } = calculateNotificationDeadline(incident);
        return isOverdue;
      });
  }

  // ── In-memory fallback ──
  return incidents.filter((incident) => {
    if (incident.notifiedAuthority) return false;
    if (incident.status === "closed" || incident.status === "resolved") return false;

    const { isOverdue } = calculateNotificationDeadline(incident);
    return isOverdue;
  });
}

/**
 * Resolve an incident with root cause and remediation details.
 */
export async function resolveIncident(
  id: string,
  data: {
    rootCause: string;
    resolution: string;
    resolvedBy: string;
    correctiveActions: string[];
    preventiveMeasures?: string;
  }
): Promise<Incident | null> {
  const updated = await updateIncident(id, {
    status: "resolved",
    rootCause: data.rootCause,
    resolution: data.resolution,
    resolvedBy: data.resolvedBy,
    correctiveActions: data.correctiveActions,
    preventiveMeasures: data.preventiveMeasures,
  });

  if (updated) {
    addTimelineEvent(
      id,
      "resolved",
      `Incident resolved. Root cause: ${data.rootCause}. Resolution: ${data.resolution}`,
      data.resolvedBy
    );
  }

  return updated;
}
