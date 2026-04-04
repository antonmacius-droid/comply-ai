/**
 * ComplianceDocument Zod Schema
 */

import { z } from "zod";

export const DocumentTypeSchema = z.enum([
  "risk_assessment",
  "conformity_declaration",
  "technical_documentation",
  "model_card",
  "data_governance_plan",
  "quality_management_system",
  "post_market_monitoring_plan",
  "fundamental_rights_impact_assessment",
  "transparency_notice",
  "human_oversight_plan",
  "incident_report",
  "registration_form",
]);

export const DocumentStatusSchema = z.enum(["draft", "approved", "archived"]);

export const ComplianceDocumentSchema = z.object({
  id: z.string().min(1),
  systemId: z.string().min(1),
  type: DocumentTypeSchema,
  title: z.string().min(1, "Document title is required"),
  content: z.string().min(1),
  version: z.string().min(1),
  status: DocumentStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  relatedArticles: z.array(z.string()).optional(),
});

export type ComplianceDocumentInput = z.infer<typeof ComplianceDocumentSchema>;
