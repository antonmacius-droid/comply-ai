/**
 * AISystem Zod Schema
 */

import { z } from "zod";

export const RiskLevelSchema = z.enum([
  "prohibited",
  "high",
  "limited",
  "minimal",
  "gpai",
]);

export const AnnexIIICategorySchema = z.enum([
  "biometrics",
  "critical_infrastructure",
  "education",
  "employment",
  "essential_services",
  "law_enforcement",
  "migration",
  "justice",
]);

export const SystemStatusSchema = z.enum([
  "draft",
  "under_review",
  "compliant",
  "non_compliant",
  "decommissioned",
]);

export const GPAITierSchema = z.enum(["standard", "systemic_risk"]);

export const AISystemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "System name is required"),
  version: z.string().min(1),
  provider: z.string().min(1, "Provider is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  status: SystemStatusSchema,
  riskLevel: RiskLevelSchema.optional(),
  annexIIICategory: AnnexIIICategorySchema.optional(),
  gpaiTier: GPAITierSchema.optional(),
  deployers: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AISystemInput = z.infer<typeof AISystemSchema>;
