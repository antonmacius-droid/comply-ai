/**
 * Incident Zod Schema
 */

import { z } from "zod";

export const IncidentSeveritySchema = z.enum(["critical", "major", "minor"]);

export const IncidentSchema = z.object({
  id: z.string().min(1),
  systemId: z.string().min(1),
  severity: IncidentSeveritySchema,
  title: z.string().min(1, "Incident title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  reportedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  notifiedAuthority: z.boolean(),
  notifiedWithin72Hours: z.boolean().optional(),
  correctiveActions: z.array(z.string()),
  affectedUsers: z.number().int().nonnegative().optional(),
  rootCause: z.string().optional(),
  preventiveMeasures: z.string().optional(),
  reportedBy: z.string().min(1).optional(),
});

export type IncidentInput = z.infer<typeof IncidentSchema>;
