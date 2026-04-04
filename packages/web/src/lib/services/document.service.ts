/**
 * Compliance Document Service
 *
 * Manages compliance documents (primarily Annex IV technical documentation)
 * for AI systems. Documents are structured with sections that map to Annex IV.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

import type { DocumentType } from "@comply-ai/core";
import { ANNEX_IV_SECTIONS, getAnnexIVTemplate } from "../pdf/annex-iv-template";
import type { AnnexIVSection, AnnexIVTemplate } from "../pdf/annex-iv-template";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocumentStatus = "draft" | "in_review" | "approved" | "archived";

export interface DocumentSection {
  key: string;
  title: string;
  guidance: string;
  content: string;
  articleReferences: string[];
  required: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface ComplianceDoc {
  id: string;
  systemId: string;
  docType: DocumentType;
  title: string;
  version: string;
  status: DocumentStatus;
  sections: DocumentSection[];
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DocumentExport {
  document: ComplianceDoc;
  exportedAt: string;
  completionPercentage: number;
  totalSections: number;
  completedSections: number;
  metadata: {
    generatedBy: string;
    format: string;
  };
}

// ---------------------------------------------------------------------------
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const documents: ComplianceDoc[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function createDocument(systemId: string, docType: DocumentType): ComplianceDoc {
  const timestamp = now();

  // Build sections from Annex IV template
  const sections: DocumentSection[] = ANNEX_IV_SECTIONS.map((s) => ({
    key: s.key,
    title: s.title,
    guidance: s.guidance,
    content: "",
    articleReferences: s.articleReferences,
    required: s.required,
  }));

  const doc: ComplianceDoc = {
    id: generateId(),
    systemId,
    docType,
    title: `${docType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Technical Documentation`,
    version: "1.0.0",
    status: "draft",
    sections,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  documents.push(doc);
  return doc;
}

export function getDocument(id: string): ComplianceDoc | null {
  return documents.find((d) => d.id === id) ?? null;
}

export function listDocuments(systemId?: string): ComplianceDoc[] {
  const result = systemId
    ? documents.filter((d) => d.systemId === systemId)
    : [...documents];

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function updateSection(
  docId: string,
  sectionKey: string,
  content: string,
  userId?: string
): ComplianceDoc | null {
  const idx = documents.findIndex((d) => d.id === docId);
  if (idx === -1) return null;

  const doc = documents[idx]!;
  const sectionIdx = doc.sections.findIndex((s) => s.key === sectionKey);
  if (sectionIdx === -1) {
    throw new Error(`Section '${sectionKey}' not found in document`);
  }

  const timestamp = now();

  const updatedSections = [...doc.sections];
  updatedSections[sectionIdx] = {
    ...updatedSections[sectionIdx]!,
    content,
    completedAt: content.trim().length > 0 ? timestamp : undefined,
    completedBy: content.trim().length > 0 ? userId : undefined,
  };

  const updated: ComplianceDoc = {
    ...doc,
    sections: updatedSections,
    updatedAt: timestamp,
  };

  documents[idx] = updated;
  return updated;
}

export { getAnnexIVTemplate };

export function exportDocument(id: string): DocumentExport | null {
  const doc = documents.find((d) => d.id === id);
  if (!doc) return null;

  const totalSections = doc.sections.length;
  const completedSections = doc.sections.filter(
    (s) => s.content.trim().length > 0
  ).length;

  return {
    document: doc,
    exportedAt: now(),
    completionPercentage:
      totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0,
    totalSections,
    completedSections,
    metadata: {
      generatedBy: "Comply AI",
      format: "json",
    },
  };
}
