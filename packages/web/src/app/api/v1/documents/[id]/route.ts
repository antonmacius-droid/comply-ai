import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSectionSchema = z.object({
  id: z.string(),
  content: z.string().optional(),
  status: z.enum(['empty', 'draft', 'complete']).optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: z.enum(['draft', 'complete', 'approved']).optional(),
  sections: z.array(updateSectionSchema).optional(),
});

// GET /api/v1/documents/:id — get a single document with all sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: authenticate and fetch from DB
    const document = {
      id,
      systemId: 'sys_001',
      title: 'Annex IV Technical Documentation',
      type: 'annex_iv',
      status: 'draft',
      version: 1,
      author: 'Anton K.',
      sections: [
        { id: 'general', number: 1, title: 'General Description', content: '', status: 'empty', guidance: 'Provide the AI system name, version, intended purpose, and developer/provider information.' },
        { id: 'detailed', number: 2, title: 'Detailed Description', content: '', status: 'empty', guidance: 'Describe the algorithms used, data processing logic, training methodologies, and system architecture.' },
        { id: 'design', number: 3, title: 'Design Specifications', content: '', status: 'empty', guidance: 'Document design choices, computational resources required, and development methodology.' },
        { id: 'capabilities', number: 4, title: 'System Capabilities & Limitations', content: '', status: 'empty', guidance: 'Describe accuracy levels, performance metrics, known limitations, and foreseeable misuse.' },
        { id: 'risk', number: 5, title: 'Risk Management', content: '', status: 'empty', guidance: 'Document risk identification, mitigation measures, and residual risks.' },
        { id: 'data', number: 6, title: 'Data Governance', content: '', status: 'empty', guidance: 'Describe training data sources, preparation methods, bias detection, and data quality.' },
        { id: 'oversight', number: 7, title: 'Human Oversight Measures', content: '', status: 'empty', guidance: 'Document human-machine interface design and oversight mechanisms.' },
        { id: 'monitoring', number: 8, title: 'Monitoring & Updates', content: '', status: 'empty', guidance: 'Describe post-market monitoring plan and update procedures.' },
        { id: 'standards', number: 9, title: 'Relevant Standards', content: '', status: 'empty', guidance: 'List EU harmonised standards applied and common specifications.' },
        { id: 'declaration', number: 10, title: 'Declaration of Conformity', content: '', status: 'empty', guidance: 'Include provider declaration and notified body information.' },
      ],
      createdAt: '2026-04-02T00:00:00Z',
      updatedAt: '2026-04-02T00:00:00Z',
    };

    return NextResponse.json({ data: document });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/documents/:id — update document (title, status, or individual sections)
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

    // TODO: authenticate, fetch existing, merge sections, update in DB
    const document = {
      id,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: document });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update document' },
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
    // TODO: authenticate, soft-delete
    return NextResponse.json({ data: { id, deleted: true } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
