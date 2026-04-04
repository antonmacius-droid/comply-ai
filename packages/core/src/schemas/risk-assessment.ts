/**
 * RiskAssessment Zod Schema
 */

import { z } from "zod";
import { RiskLevelSchema } from "./ai-system.js";

export const ProhibitedPracticeSchema = z.enum([
  "social_scoring",
  "exploitation_vulnerable",
  "subliminal_manipulation",
  "biometric_categorization_sensitive",
  "facial_recognition_scraping",
  "emotion_inference_workplace",
  "real_time_biometric_identification",
  "predictive_policing",
]);

export const RiskAssessmentSchema = z.object({
  systemId: z.string().min(1),
  riskLevel: RiskLevelSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.array(z.string()).min(1, "At least one rationale is required"),
  prohibitedPractices: z.array(ProhibitedPracticeSchema),
  applicableArticles: z.array(z.string()),
  requirements: z.array(z.string()),
  warnings: z.array(z.string()),
  assessedAt: z.string().datetime(),
  assessedBy: z.string().min(1),
});

export type RiskAssessmentInput = z.infer<typeof RiskAssessmentSchema>;
