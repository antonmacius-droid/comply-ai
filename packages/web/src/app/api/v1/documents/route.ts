import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  listDocuments,
  createDocument,
} from '@/lib/services/document.service';
import type { DocumentType } from '@comply-ai/core';

const createDocumentSchema = z.object({
  systemId: z.string().min(1),
  type: z.enum([
    'technical_documentation', 'risk_assessment', 'conformity_declaration',
    'model_card', 'data_governance_plan', 'quality_management_system',
    'post_market_monitoring_plan', 'fundamental_rights_impact_assessment',
    'transparency_notice', 'human_oversight_plan', 'incident_report', 'registration_form',
  ]).default('technical_documentation'),
});

// GET /api/v1/documents — list all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    const docs = listDocuments(systemId ?? undefined);

    // Map to response shape with computed fields
    const data = docs.map((doc) => ({
      ...doc,
      sectionsComplete: doc.sections.filter((s) => s.content.trim().length > 0).length,
      sectionsTotal: doc.sections.length,
    }));

    return NextResponse.json({ data, total: data.length });
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

    const document = createDocument(
      parsed.data.systemId,
      parsed.data.type as DocumentType
    );

    return NextResponse.json({ data: document }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
