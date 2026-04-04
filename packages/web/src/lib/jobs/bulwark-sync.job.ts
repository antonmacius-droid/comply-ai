/**
 * Bulwark Sync Job
 *
 * Pulls audit entries from a Bulwark AI gateway and maps them
 * to evidence records and AI systems within Comply AI.
 * Tracks last sync timestamp to avoid re-processing.
 * Currently simulated — will use real BulwarkClient when connected.
 */

import { createQueue, createWorker, QUEUE_NAMES } from "./queue";
import type { JobResult } from "./queue";
import type { BulwarkAuditEntry } from "../bulwark/client";
import { mapAuditToEvidence, mapAuditToSystem } from "../bulwark/mapper";
import type { DiscoveredAISystem, MappedMonitoringCheck } from "../bulwark/mapper";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BulwarkSyncInput {
  connectionId: string;
}

export interface BulwarkSyncOutput {
  connectionId: string;
  syncedAt: string;
  entriesPulled: number;
  evidenceCreated: number;
  systemsDiscovered: number;
  discoveredSystems: DiscoveredAISystem[];
}

// ---------------------------------------------------------------------------
// In-memory sync tracking
// ---------------------------------------------------------------------------

interface SyncRecord {
  connectionId: string;
  lastSyncAt: string;
  entriesPulled: number;
  evidenceCreated: number;
  systemsDiscovered: number;
}

const syncHistory: SyncRecord[] = [];

export function getSyncHistory(connectionId?: string): SyncRecord[] {
  const records = connectionId
    ? syncHistory.filter((r) => r.connectionId === connectionId)
    : [...syncHistory];
  return records.sort(
    (a, b) =>
      new Date(b.lastSyncAt).getTime() - new Date(a.lastSyncAt).getTime()
  );
}

export function getLastSync(connectionId: string): SyncRecord | null {
  const records = syncHistory
    .filter((r) => r.connectionId === connectionId)
    .sort(
      (a, b) =>
        new Date(b.lastSyncAt).getTime() - new Date(a.lastSyncAt).getTime()
    );
  return records[0] ?? null;
}

// ---------------------------------------------------------------------------
// Simulated Bulwark data
// ---------------------------------------------------------------------------

function generateMockAuditEntries(): BulwarkAuditEntry[] {
  const models = ["gpt-4o", "claude-3-opus", "gpt-4o-mini", "claude-3-sonnet"];
  const providers = ["openai", "anthropic", "openai", "anthropic"];
  const users = ["user_001", "user_002", "user_003", "user_004", "user_005"];
  const entries: BulwarkAuditEntry[] = [];

  const count = 8 + Math.floor(Math.random() * 12);

  for (let i = 0; i < count; i++) {
    const modelIdx = Math.floor(Math.random() * models.length);
    const isFlagged = Math.random() < 0.12;

    entries.push({
      id: crypto.randomUUID(),
      timestamp: new Date(
        Date.now() - Math.floor(Math.random() * 3600000)
      ).toISOString(),
      userId: users[Math.floor(Math.random() * users.length)]!,
      model: models[modelIdx]!,
      provider: providers[modelIdx]!,
      promptTokens: 100 + Math.floor(Math.random() * 2000),
      completionTokens: 50 + Math.floor(Math.random() * 1500),
      totalTokens: 200 + Math.floor(Math.random() * 3500),
      latencyMs: 200 + Math.floor(Math.random() * 2000),
      statusCode: Math.random() > 0.05 ? 200 : 500,
      flagged: isFlagged,
      flagReason: isFlagged
        ? ["PII detected", "Content policy violation", "Rate limit exceeded"][
            Math.floor(Math.random() * 3)
          ]
        : undefined,
      policyId: isFlagged ? `policy_${Math.floor(Math.random() * 5) + 1}` : undefined,
      metadata: {},
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Job processor
// ---------------------------------------------------------------------------

async function processBulwarkSync(
  data: BulwarkSyncInput
): Promise<JobResult<BulwarkSyncOutput>> {
  try {
    // In production, would use:
    // const client = new BulwarkClient(connectionUrl, connectionApiKey);
    // const response = await client.getAuditEntries({ startDate: lastSync });
    // const entries = response.data;

    const entries = generateMockAuditEntries();

    // Map audit entries to evidence (not persisting yet — just counting)
    const evidenceInputs = entries.map((e) =>
      mapAuditToEvidence(e, "sys_placeholder")
    );

    // Discover systems from audit data
    const discoveredSystems = mapAuditToSystem(entries);

    const syncRecord: SyncRecord = {
      connectionId: data.connectionId,
      lastSyncAt: new Date().toISOString(),
      entriesPulled: entries.length,
      evidenceCreated: evidenceInputs.length,
      systemsDiscovered: discoveredSystems.length,
    };

    syncHistory.push(syncRecord);

    const output: BulwarkSyncOutput = {
      connectionId: data.connectionId,
      syncedAt: syncRecord.lastSyncAt,
      entriesPulled: entries.length,
      evidenceCreated: evidenceInputs.length,
      systemsDiscovered: discoveredSystems.length,
      discoveredSystems,
    };

    return { success: true, data: output };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Bulwark sync failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Queue & Worker
// ---------------------------------------------------------------------------

export const bulwarkSyncQueue = createQueue<
  BulwarkSyncInput,
  BulwarkSyncOutput
>(QUEUE_NAMES.BULWARK_SYNC);

export const bulwarkSyncWorker = createWorker<
  BulwarkSyncInput,
  BulwarkSyncOutput
>(QUEUE_NAMES.BULWARK_SYNC, processBulwarkSync);
