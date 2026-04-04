import type { EvidenceType } from "../types/eu-ai-act.js";

export interface ChecklistItem {
  /** Unique identifier, e.g. "HR-RMS-01" */
  id: string;
  /** Short requirement title */
  requirement: string;
  /** EU AI Act article reference */
  article: string;
  /** Detailed description of what needs to be done */
  description: string;
  /** Whether this item is mandatory or recommended */
  mandatory: boolean;
  /** Types of evidence that can demonstrate compliance */
  evidenceTypes: EvidenceType[];
  /** Topical category for grouping */
  category: string;
}

export interface Checklist {
  /** Title of the checklist */
  title: string;
  /** Description */
  description: string;
  /** Target risk level */
  riskLevel: string;
  /** All checklist items */
  items: ChecklistItem[];
}
