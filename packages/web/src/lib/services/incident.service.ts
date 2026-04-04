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
export function escalateIncident(
  id: string,
  escalatedBy: string = "system"
): Incident | null {
  const incident = getIncident(id);
  if (!incident) return null;

  const notifiedAt = now();
  const reportedTime = new Date(incident.reportedAt).getTime();
  const notifiedTime = new Date(notifiedAt).getTime();
  const hoursDiff = (notifiedTime - reportedTime) / (1000 * 60 * 60);
  const within72Hours = hoursDiff <= 72;

  const updated = updateIncident(id, {
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
export function getIncidentTimeline(
  incidentId: string
): IncidentTimelineEvent[] {
  // Always include a "created" event based on the incident itself
  const incident = getIncident(incidentId);
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
export function getOverdueIncidents(): Incident[] {
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
export function resolveIncident(
  id: string,
  data: {
    rootCause: string;
    resolution: string;
    resolvedBy: string;
    correctiveActions: string[];
    preventiveMeasures?: string;
  }
): Incident | null {
  const updated = updateIncident(id, {
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
