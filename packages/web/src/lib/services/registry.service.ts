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
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const systems: AISystem[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function listSystems(orgId: string, filter?: ListSystemsFilter): AISystem[] {
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

export function getSystem(id: string, orgId: string): AISystem | null {
  const system = systems.find((s) => s.id === id && s.orgId === orgId && !s.deleted);
  return system ?? null;
}

export function createSystem(data: CreateSystemInput, orgId: string): AISystem {
  const validated = CreateSystemSchema.parse(data);
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

export function updateSystem(
  id: string,
  data: UpdateSystemInput,
  orgId: string
): AISystem | null {
  const idx = systems.findIndex((s) => s.id === id && s.orgId === orgId && !s.deleted);
  if (idx === -1) return null;

  const validated = UpdateSystemSchema.parse(data);
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

export function deleteSystem(id: string, orgId: string): boolean {
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
