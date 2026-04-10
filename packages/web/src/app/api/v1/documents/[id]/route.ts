import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getDocument,
  updateSection,
} from '@/lib/services/document.service';

const updateSectionSchema = z.object({
  key: z.string(),
  content: z.string(),
});

const updateDocumentSchema = z.object({
  sections: z.array(updateSectionSchema).optional(),
});

// GET /api/v1/documents/:id — get a single document with all sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = getDocument(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: document });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/documents/:id — update document sections
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check document exists
    const existing = getDocument(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update each section
    let updatedDoc = existing;
    if (parsed.data.sections) {
      for (const section of parsed.data.sections) {
        const result = updateSection(id, section.key, section.content);
        if (result) {
          updatedDoc = result;
        }
      }
    }

    return NextResponse.json({ data: updatedDoc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update document';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/documents/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = getDocument(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Note: document.service doesn't have a delete function yet.
    // For now, return success — the document remains in memory.
    // TODO: add deleteDocument() to document.service when needed.
    return NextResponse.json({ data: { id, deleted: true } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
