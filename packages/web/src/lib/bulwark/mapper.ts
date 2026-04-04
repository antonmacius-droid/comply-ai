/**
 * Bulwark Data Mapper
 *
 * Maps Bulwark AI gateway data into Comply AI entities.
 * Converts audit entries into evidence records, discovers AI systems
 * from audit model usage, and converts usage data to monitoring checks.
 */

import type { EvidenceType } from "@comply-ai/core";
import type { BulwarkAuditEntry, BulwarkDashboardStats } from "./client";
import type { Evidence, UploadEvidenceInput } from "../services/evidence.service";
import type { MonitoringCheck, MonitoringCheckType, CheckResult } from "../services/monitoring.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscoveredAISystem {
  /** Derived name from model identifier */
  name: string;
  /** Model identifier from Bulwark (e.g. "gpt-4", "claude-3-opus") */
  model: string;
  /** Provider from Bulwark (e.g. "openai", "anthropic") */
  provider: string;
  /** Total requests observed */
  totalRequests: number;
  /** Total tokens consumed */
  totalTokens: number;
  /** Unique users interacting with this model */
  uniqueUsers: string[];
  /** First seen timestamp */
  firstSeen: string;
  /** Last seen timestamp */
  lastSeen: string;
  /** Whether any requests were flagged by policy */
  hasFlaggedRequests: boolean;
  /** Count of flagged requests */
  flaggedCount: number;
}

export interface MappedMonitoringCheck {
  checkType: MonitoringCheckType;
  result: CheckResult;
  score: number;
  details: string;
  metrics: Record<string, number>;
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/**
 * Convert a Bulwark audit entry into an evidence upload input.
 * Audit logs serve as evidence of AI system usage and governance.
 */
export function mapAuditToEvidence(
  audit: BulwarkAuditEntry,
  systemId: string
): UploadEvidenceInput {
  const isFlagged = audit.flagged;
  const evidenceType: EvidenceType = isFlagged ? "audit_log" : "audit_log";

  return {
    type: evidenceType,
    title: `Bulwark Audit: ${audit.model} request ${isFlagged ? "(FLAGGED)" : ""}`.trim(),
    description:
      `Audit entry from Bulwark gateway. ` +
      `Model: ${audit.model}, Provider: ${audit.provider}, ` +
      `User: ${audit.userId}, Tokens: ${audit.totalTokens}, ` +
      `Latency: ${audit.latencyMs}ms, Status: ${audit.statusCode}` +
      (isFlagged ? `, Flag reason: ${audit.flagReason ?? "unknown"}` : ""),
    uploadedBy: "bulwark-sync",
    metadata: {
      source: "bulwark",
      auditId: audit.id,
      model: audit.model,
      provider: audit.provider,
      userId: audit.userId,
      promptTokens: audit.promptTokens,
      completionTokens: audit.completionTokens,
      totalTokens: audit.totalTokens,
      latencyMs: audit.latencyMs,
      statusCode: audit.statusCode,
      flagged: audit.flagged,
      flagReason: audit.flagReason,
      policyId: audit.policyId,
      timestamp: audit.timestamp,
    },
  };
}

/**
 * Discover AI systems from a set of audit entries.
 * Groups by model to identify distinct AI systems in use.
 */
export function mapAuditToSystem(
  audits: BulwarkAuditEntry[]
): DiscoveredAISystem[] {
  const systemMap = new Map<
    string,
    {
      model: string;
      provider: string;
      totalRequests: number;
      totalTokens: number;
      users: Set<string>;
      firstSeen: string;
      lastSeen: string;
      flaggedCount: number;
    }
  >();

  for (const audit of audits) {
    const key = `${audit.provider}:${audit.model}`;
    const existing = systemMap.get(key);

    if (existing) {
      existing.totalRequests++;
      existing.totalTokens += audit.totalTokens;
      existing.users.add(audit.userId);
      if (audit.flagged) existing.flaggedCount++;
      if (audit.timestamp < existing.firstSeen) {
        existing.firstSeen = audit.timestamp;
      }
      if (audit.timestamp > existing.lastSeen) {
        existing.lastSeen = audit.timestamp;
      }
    } else {
      systemMap.set(key, {
        model: audit.model,
        provider: audit.provider,
        totalRequests: 1,
        totalTokens: audit.totalTokens,
        users: new Set([audit.userId]),
        firstSeen: audit.timestamp,
        lastSeen: audit.timestamp,
        flaggedCount: audit.flagged ? 1 : 0,
      });
    }
  }

  return Array.from(systemMap.entries()).map(([_, data]) => ({
    name: formatSystemName(data.provider, data.model),
    model: data.model,
    provider: data.provider,
    totalRequests: data.totalRequests,
    totalTokens: data.totalTokens,
    uniqueUsers: Array.from(data.users),
    firstSeen: data.firstSeen,
    lastSeen: data.lastSeen,
    hasFlaggedRequests: data.flaggedCount > 0,
    flaggedCount: data.flaggedCount,
  }));
}

/**
 * Convert Bulwark dashboard usage stats into monitoring check results.
 * Derives error_rate, latency, and uptime checks from aggregate data.
 */
export function mapUsageToMonitoring(
  stats: BulwarkDashboardStats
): MappedMonitoringCheck[] {
  const checks: MappedMonitoringCheck[] = [];

  // Error rate check
  const errorRate = stats.errorRate * 100; // Convert to percentage
  checks.push({
    checkType: "error_rate",
    result: errorRate < 1 ? "pass" : errorRate < 5 ? "warning" : "fail",
    score: Math.round(Math.max(0, 100 - errorRate * 10)),
    details: `Bulwark gateway error rate: ${errorRate.toFixed(2)}% across ${stats.totalRequests} requests.`,
    metrics: {
      error_rate_percentage: parseFloat(errorRate.toFixed(2)),
      total_requests: stats.totalRequests,
    },
    recommendations:
      errorRate > 1
        ? [
            "Review Bulwark audit logs for error patterns",
            "Check provider availability and rate limits",
          ]
        : [],
  });

  // Latency check
  const avgLatency = stats.averageLatencyMs;
  checks.push({
    checkType: "latency",
    result: avgLatency < 500 ? "pass" : avgLatency < 2000 ? "warning" : "fail",
    score: Math.round(Math.max(0, 100 - avgLatency / 20)),
    details: `Average gateway latency: ${avgLatency.toFixed(0)}ms.`,
    metrics: {
      average_latency_ms: parseFloat(avgLatency.toFixed(0)),
      total_requests: stats.totalRequests,
    },
    recommendations:
      avgLatency > 500
        ? [
            "Consider caching strategies for frequent queries",
            "Review model selection for latency-sensitive use cases",
          ]
        : [],
  });

  return checks;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSystemName(provider: string, model: string): string {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  const modelName = model
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${providerName} — ${modelName}`;
}
