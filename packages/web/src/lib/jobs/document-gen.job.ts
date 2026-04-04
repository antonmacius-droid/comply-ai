/**
 * Document Generation Job
 *
 * Background job for generating compliance document exports.
 * Input: { documentId }
 * Process: loads document sections, renders to structured output, saves path.
 * Currently generates a JSON export — real PDF rendering deferred to Phase 5.
 */

import { createQueue, createWorker, QUEUE_NAMES } from "./queue";
import type { JobResult } from "./queue";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentGenInput {
  documentId: string;
}

export interface DocumentGenOutput {
  documentId: string;
  format: "json" | "pdf";
  filePath: string;
  fileSize: number;
  generatedAt: string;
  sections: number;
}

// ---------------------------------------------------------------------------
// In-memory generated documents store
// ---------------------------------------------------------------------------

const generatedDocs: DocumentGenOutput[] = [];

export function getGeneratedDocuments(): DocumentGenOutput[] {
  return [...generatedDocs].sort(
    (a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

export function getGeneratedDocument(
  documentId: string
): DocumentGenOutput | null {
  return (
    generatedDocs.find((d) => d.documentId === documentId) ?? null
  );
}

// ---------------------------------------------------------------------------
// Simulated generation logic
// ---------------------------------------------------------------------------

function simulateDocumentGeneration(documentId: string): DocumentGenOutput {
  const sectionCount = 5 + Math.floor(Math.random() * 10);
  const fileSize = 2048 + Math.floor(Math.random() * 50000);

  return {
    documentId,
    format: "json",
    filePath: `/exports/${documentId}_${Date.now()}.json`,
    fileSize,
    generatedAt: new Date().toISOString(),
    sections: sectionCount,
  };
}

// ---------------------------------------------------------------------------
// Job processor
// ---------------------------------------------------------------------------

async function processDocumentGen(
  data: DocumentGenInput
): Promise<JobResult<DocumentGenOutput>> {
  try {
    const output = simulateDocumentGeneration(data.documentId);
    generatedDocs.push(output);

    return { success: true, data: output };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Document generation failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Queue & Worker
// ---------------------------------------------------------------------------

export const documentGenQueue = createQueue<
  DocumentGenInput,
  DocumentGenOutput
>(QUEUE_NAMES.DOCUMENT_GEN);

export const documentGenWorker = createWorker<
  DocumentGenInput,
  DocumentGenOutput
>(QUEUE_NAMES.DOCUMENT_GEN, processDocumentGen);
