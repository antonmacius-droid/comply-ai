/**
 * EU AI Act Type Definitions
 *
 * Based on Regulation (EU) 2024/1689 — the EU Artificial Intelligence Act.
 * These types model the regulation's risk-based classification framework.
 */

// ---------------------------------------------------------------------------
// Risk levels (Article 6, recitals 31-48)
// ---------------------------------------------------------------------------

/**
 * The four-tier risk classification plus GPAI designation.
 *
 * - prohibited: Article 5 — banned outright
 * - high: Articles 6-49, Annex III — heavy obligations
 * - limited: Article 50 — transparency obligations
 * - minimal: Article 95 — voluntary codes of conduct
 * - gpai: Articles 51-56 — general-purpose AI models
 */
export type RiskLevel = "prohibited" | "high" | "limited" | "minimal" | "gpai";

// ---------------------------------------------------------------------------
// Annex III — High-risk AI system categories (8 areas)
// ---------------------------------------------------------------------------

/**
 * The eight high-risk areas defined in Annex III of the EU AI Act.
 */
export type AnnexIIICategory =
  | "biometrics"
  | "critical_infrastructure"
  | "education"
  | "employment"
  | "essential_services"
  | "law_enforcement"
  | "migration"
  | "justice";

// ---------------------------------------------------------------------------
// Article 5 — Prohibited AI practices
// ---------------------------------------------------------------------------

/**
 * The eight categories of prohibited AI practices under Article 5.
 */
export type ProhibitedPractice =
  | "social_scoring"
  | "exploitation_vulnerable"
  | "subliminal_manipulation"
  | "biometric_categorization_sensitive"
  | "facial_recognition_scraping"
  | "emotion_inference_workplace"
  | "real_time_biometric_identification"
  | "predictive_policing";

// ---------------------------------------------------------------------------
// AI System lifecycle status
// ---------------------------------------------------------------------------

export type SystemStatus =
  | "draft"
  | "under_review"
  | "compliant"
  | "non_compliant"
  | "decommissioned";

// ---------------------------------------------------------------------------
// Compliance document types
// ---------------------------------------------------------------------------

export type DocumentType =
  | "risk_assessment"
  | "conformity_declaration"
  | "technical_documentation"
  | "model_card"
  | "data_governance_plan"
  | "quality_management_system"
  | "post_market_monitoring_plan"
  | "fundamental_rights_impact_assessment"
  | "transparency_notice"
  | "human_oversight_plan"
  | "incident_report"
  | "registration_form";

// ---------------------------------------------------------------------------
// Evidence types (for checklist items)
// ---------------------------------------------------------------------------

export type EvidenceType =
  | "document"
  | "test_result"
  | "audit_log"
  | "certification"
  | "policy"
  | "procedure"
  | "training_record"
  | "monitoring_report"
  | "technical_spec"
  | "third_party_audit";

// ---------------------------------------------------------------------------
// GPAI model tiers (Articles 51-56)
// ---------------------------------------------------------------------------

/**
 * GPAI models above 10^25 FLOPs are presumed systemic risk (Art. 51(2)).
 */
export type GPAITier = "standard" | "systemic_risk";

// ---------------------------------------------------------------------------
// Conformity assessment type (Article 43)
// ---------------------------------------------------------------------------

export type ConformityAssessmentType =
  | "internal" // Art. 43(1) — most high-risk systems
  | "third_party"; // Art. 43(1) — biometric systems require this

// ---------------------------------------------------------------------------
// Incident severity (Article 62)
// ---------------------------------------------------------------------------

export type IncidentSeverity = "critical" | "major" | "minor";

// ---------------------------------------------------------------------------
// Composite interfaces
// ---------------------------------------------------------------------------

export interface AISystemMetadata {
  id: string;
  name: string;
  version: string;
  provider: string;
  description: string;
  purpose: string;
  status: SystemStatus;
  riskLevel?: RiskLevel;
  annexIIICategory?: AnnexIIICategory;
  gpaiTier?: GPAITier;
  deployers?: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface RiskAssessmentResult {
  systemId: string;
  riskLevel: RiskLevel;
  confidence: number;
  rationale: string[];
  prohibitedPractices: ProhibitedPractice[];
  applicableArticles: string[];
  requirements: string[];
  warnings: string[];
  assessedAt: string; // ISO 8601
  assessedBy: string;
}

export interface ComplianceDocument {
  id: string;
  systemId: string;
  type: DocumentType;
  title: string;
  content: string;
  version: string;
  status: "draft" | "approved" | "archived";
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
}

export interface IncidentRecord {
  id: string;
  systemId: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  reportedAt: string;
  resolvedAt?: string;
  notifiedAuthority: boolean;
  notifiedWithin72Hours?: boolean; // Art. 62 requirement
  correctiveActions: string[];
}
