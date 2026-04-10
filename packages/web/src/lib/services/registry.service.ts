/**
 * AI System Registry Service
 *
 * Manages the registry of AI systems within an organization.
 * Uses in-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import { z } from "zod";
import {
  AISystemSchema,
  RiskLevelSchema,
  AnnexIIICategorySchema,
  SystemStatusSchema,
  GPAITierSchema,
} from "@comply-ai/core";
import type { RiskLevel, SystemStatus, AnnexIIICategory, GPAITier } from "@comply-ai/core";
import { eq, and, desc, like, or } from "drizzle-orm";
import { db, isDbConnected } from "@/lib/db";
import { aiSystems } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AISystem {
  id: string;
  orgId: string;
  name: string;
  version: string;
  provider: string;
  description: string;
  purpose: string;
  status: SystemStatus;
  riskLevel?: RiskLevel;
  annexIIICategory?: AnnexIIICategory;
  gpaiTier?: GPAITier;
  deployers: string[];
  tags: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CreateSystemSchema = z.object({
  name: z.string().min(1, "System name is required"),
  version: z.string().min(1).default("1.0.0"),
  provider: z.string().min(1, "Provider is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  riskLevel: RiskLevelSchema.optional(),
  annexIIICategory: AnnexIIICategorySchema.optional(),
  gpaiTier: GPAITierSchema.optional(),
  deployers: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateSystemInput = z.infer<typeof CreateSystemSchema>;

export const UpdateSystemSchema = CreateSystemSchema.partial();
export type UpdateSystemInput = z.infer<typeof UpdateSystemSchema>;

export interface ListSystemsFilter {
  status?: SystemStatus;
  riskLevel?: RiskLevel;
  search?: string;
}

// ---------------------------------------------------------------------------
// In-memory store (fallback when Postgres is not connected)
// ---------------------------------------------------------------------------

const systems: AISystem[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// DB ↔ Service type mapping helpers
// ---------------------------------------------------------------------------

type DbRow = typeof aiSystems.$inferSelect;

function dbRowToSystem(row: DbRow): AISystem {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    version: (meta.version as string) ?? "1.0.0",
    provider: row.providerType ?? "",
    description: row.description ?? "",
    purpose: row.purpose ?? "",
    status: row.status as SystemStatus,
    riskLevel: row.riskLevel as RiskLevel | undefined,
    annexIIICategory: (meta.annexIIICategory as AnnexIIICategory) ?? undefined,
    gpaiTier: (meta.gpaiTier as GPAITier) ?? undefined,
    deployers: (meta.deployers as string[]) ?? [],
    tags: (meta.tags as string[]) ?? [],
    deleted: row.status === "archived",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listSystems(orgId: string, filter?: ListSystemsFilter): Promise<AISystem[]> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const conditions = [
      eq(aiSystems.orgId, orgId),
    ];

    // Exclude archived (soft-deleted) unless explicitly filtering for archived
    if (filter?.status) {
      conditions.push(eq(aiSystems.status, filter.status as "draft" | "active" | "archived"));
    } else {
      // By default hide archived
      conditions.push(
        or(eq(aiSystems.status, "draft"), eq(aiSystems.status, "active"))!
      );
    }

    if (filter?.riskLevel) {
      conditions.push(eq(aiSystems.riskLevel, filter.riskLevel as "unacceptable" | "high" | "limited" | "minimal" | "gpai"));
    }

    let rows = await db
      .select()
      .from(aiSystems)
      .where(and(...conditions))
      .orderBy(desc(aiSystems.updatedAt));

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.providerType ?? "").toLowerCase().includes(q)
      );
    }

    return rows.map(dbRowToSystem);
  }

  // ── In-memory fallback ──
  let result = systems.filter((s) => s.orgId === orgId && !s.deleted);

  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  if (filter?.riskLevel) {
    result = result.filter((s) => s.riskLevel === filter.riskLevel);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q)
    );
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getSystem(id: string, orgId: string): Promise<AISystem | null> {
  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const row = await db.query.aiSystems.findFirst({
      where: and(eq(aiSystems.id, id), eq(aiSystems.orgId, orgId)),
    });
    if (!row || row.status === "archived") return null;
    return dbRowToSystem(row);
  }

  // ── In-memory fallback ──
  const system = systems.find((s) => s.id === id && s.orgId === orgId && !s.deleted);
  return system ?? null;
}

export async function createSystem(data: CreateSystemInput, orgId: string): Promise<AISystem> {
  const validated = CreateSystemSchema.parse(data);

  // ── Drizzle path ──
  if (isDbConnected() && db) {
    const metadata = {
      version: validated.version,
      deployers: validated.deployers ?? [],
      tags: validated.tags ?? [],
      annexIIICategory: validated.annexIIICategory,
      gpaiTier: validated.gpaiTier,
    };

    const [row] = await db
      .insert(aiSystems)
      .values({
        orgId,
        name: validated.name,
        description: validated.description,
        purpose: validated.purpose,
        status: "draft",
        riskLevel: (validated.riskLevel ?? "minimal") as "unacceptable" | "high" | "limited" | "minimal" | "gpai",
        providerType: validated.provider,
        metadata,
      })
      .returning();

    return dbRowToSystem(row!);
  }

  // ── In-memory fallback ──
  const timestamp = now();

  const system: AISystem = {
    id: generateId(),
    orgId,
    name: validated.name,
    version: validated.version,
    provider: validated.provider,
    description: validated.description,
    purpose: validated.purpose,
    status: "draft",
    riskLevel: validated.riskLevel,
    annexIIICategory: validated.annexIIICategory,
    gpaiTier: validated.gpaiTier,
    deployers: validated.deployers ?? [],
    tags: validated.tags ?? [],
    deleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  systems.push(system);
  return system;
}

export async function updateSystem(
  id: string,
  data: UpdateSystemInput,
  orgId: string
): Promise<AISystem | null> {
  const validated = UpdateSystemSchema.parse(data);

  // ── Drizzle path ──
  if (isDbConnected() && db) {
    // Fetch current row to merge metadata
    const existing = await db.query.aiSystems.findFirst({
      where: and(eq(aiSystems.id, id), eq(aiSystems.orgId, orgId)),
    });
    if (!existing || existing.status === "archived") return null;

    const oldMeta = (existing.metadata ?? {}) as Record<string, unknown>;
    const newMeta = { ...oldMeta };

    // Update metadata-stored fields if provided
    if (validated.version !== undefined) newMeta.version = validated.version;
    if (validated.deployers !== undefined) newMeta.deployers = validated.deployers;
    if (validated.tags !== undefined) newMeta.tags = validated.tags;
    if (validated.annexIIICategory !== undefined) newMeta.annexIIICategory = validated.annexIIICategory;
    if (validated.gpaiTier !== undefined) newMeta.gpaiTier = validated.gpaiTier;

    const setValues: Record<string, unknown> = {
      metadata: newMeta,
      updatedAt: new Date(),
    };
    if (validated.name !== undefined) setValues.name = validated.name;
    if (validated.description !== undefined) setValues.description = validated.description;
    if (validated.purpose !== undefined) setValues.purpose = validated.purpose;
    if (validated.provider !== undefined) setValues.providerType = validated.provider;
    if (validated.riskLevel !== undefined) setValues.riskLevel = validated.riskLevel;

    const [row] = await db
      .update(aiSystems)
      .set(setValues)
      .where(and(eq(aiSystems.id, id), eq(aiSystems.orgId, orgId)))
      .returning();

    return row ? dbRowToSystem(row) : null;
  }

  // ── In-memory fallback ──
  const idx = systems.findIndex((s) => s.id === id && s.orgId === orgId && !s.deleted);
  if (idx === -1) return null;

  const existing = systems[idx]!;

  const updated: AISystem = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(validated).filter(([_, v]) => v !== undefined)
    ),
    updatedAt: now(),
  };

  systems[idx] = updated;
  return updated;
}

export async function deleteSystem(id: string, orgId: string): Promise<boolean> {
  // ── Drizzle path ── (soft delete via status='archived')
  if (isDbConnected() && db) {
    const [row] = await db
      .update(aiSystems)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(aiSystems.id, id), eq(aiSystems.orgId, orgId)))
      .returning();
    return !!row;
  }

  // ── In-memory fallback ──
  const idx = systems.findIndex((s) => s.id === id && s.orgId === orgId && !s.deleted);
  if (idx === -1) return false;

  systems[idx] = {
    ...systems[idx]!,
    deleted: true,
    status: "decommissioned",
    updatedAt: now(),
  };

  return true;
}
