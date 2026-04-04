import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const sectionSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  content: z.string().default(''),
  status: z.enum(['empty', 'draft', 'complete']).default('empty'),
});

const createDocumentSchema = z.object({
  systemId: z.string().min(1),
  title: z.string().min(1).max(500).default('Annex IV Technical Documentation'),
  type: z.enum(['annex_iv', 'risk_report', 'model_card']).default('annex_iv'),
  sections: z.array(sectionSchema).optional(),
});

// GET /api/v1/documents — list all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    // TODO: authenticate and query DB
    const documents = [
      {
        id: 'doc_001',
        systemId: 'sys_001',
        title: 'Annex IV Technical Documentation',
        type: 'annex_iv',
        status: 'draft',
        version: 1,
        author: 'Anton K.',
        sectionsComplete: 3,
        sectionsTotal: 10,
        createdAt: '2026-04-02T00:00:00Z',
        updatedAt: '2026-04-02T00:00:00Z',
      },
      {
        id: 'doc_002',
        systemId: 'sys_003',
        title: 'Annex IV Technical Documentation',
        type: 'annex_iv',
        status: 'complete',
        version: 2,
        author: 'Maria L.',
        sectionsComplete: 10,
        sectionsTotal: 10,
        createdAt: '2026-03-18T00:00:00Z',
        updatedAt: '2026-03-28T00:00:00Z',
      },
    ];

    const filtered = systemId
      ? documents.filter((d) => d.systemId === systemId)
      : documents;

    return NextResponse.json({ data: filtered, total: filtered.length });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/v1/documents — create a new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const defaultSections = [
      { id: 'general', number: 1, title: 'General Description' },
      { id: 'detailed', number: 2, title: 'Detailed Description' },
      { id: 'design', number: 3, title: 'Design Specifications' },
      { id: 'capabilities', number: 4, title: 'System Capabilities & Limitations' },
      { id: 'risk', number: 5, title: 'Risk Management' },
      { id: 'data', number: 6, title: 'Data Governance' },
      { id: 'oversight', number: 7, title: 'Human Oversight Measures' },
      { id: 'monitoring', number: 8, title: 'Monitoring & Updates' },
      { id: 'standards', number: 9, title: 'Relevant Standards' },
      { id: 'declaration', number: 10, title: 'Declaration of Conformity' },
    ].map((s) => ({ ...s, content: '', status: 'empty' as const }));

    const document = {
      id: 'doc_' + Math.random().toString(36).slice(2, 8),
      ...parsed.data,
      sections: parsed.data.sections || defaultSections,
      status: 'draft',
      version: 1,
      author: 'Anton K.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: document }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
