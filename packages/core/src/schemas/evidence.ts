/**
 * Evidence Zod Schema
 */

import { z } from "zod";

export const EvidenceTypeSchema = z.enum([
  "document",
  "test_result",
  "audit_log",
  "certification",
  "policy",
  "procedure",
  "training_record",
  "monitoring_report",
  "technical_spec",
  "third_party_audit",
]);

export const EvidenceSchema = z.object({
  id: z.string().min(1),
  systemId: z.string().min(1),
  checklistItemId: z.string().min(1),
  type: EvidenceTypeSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileHash: z.string().optional(),
  uploadedAt: z.string().datetime(),
  uploadedBy: z.string().min(1),
  verified: z.boolean().default(false),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type EvidenceInput = z.infer<typeof EvidenceSchema>;
