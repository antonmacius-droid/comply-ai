import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createAssessmentSchema = z.object({
  systemId: z.string().uuid(),
  riskLevel: z.enum(['unacceptable', 'high', 'limited', 'minimal', 'gpai']),
  annexIiiCategory: z.string().max(128).optional(),
  scores: z.record(z.unknown()).optional(),
  rationale: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved']).default('draft'),
});

// GET /api/v1/assessments — list risk assessments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    // TODO: authenticate, query DB
    // const { db } = await import('@/lib/db');
    // const { riskAssessments } = await import('@/lib/db/schema');

    const assessments = [
      {
        id: 'ra_001',
        systemId: 'sys_001',
        version: 3,
        assessorId: 'usr_001',
        riskLevel: 'high',
        annexIiiCategory: '5b',
        scores: {
          transparency: 7,
          dataGovernance: 8,
          humanOversight: 6,
          accuracy: 8,
          robustness: 7,
          cybersecurity: 7,
        },
        rationale: 'System processes personal financial data for credit decisions under Annex III category 5(b).',
        status: 'approved',
        createdAt: '2026-03-15T00:00:00Z',
      },
      {
        id: 'ra_002',
        systemId: 'sys_002',
        version: 1,
        assessorId: 'usr_002',
        riskLevel: 'limited',
        annexIiiCategory: null,
        scores: {
          transparency: 8,
          dataGovernance: 7,
          humanOversight: 9,
          accuracy: 7,
          robustness: 6,
          cybersecurity: 7,
        },
        rationale: 'Customer-facing chatbot with transparency obligations under Article 52.',
        status: 'submitted',
        createdAt: '2026-03-12T00:00:00Z',
      },
    ];

    const filtered = systemId
      ? assessments.filter((a) => a.systemId === systemId)
      : assessments;

    return NextResponse.json({ data: filtered, total: filtered.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST /api/v1/assessments — create a new risk assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // TODO: authenticate, insert into DB, log to audit trail
    // const { db } = await import('@/lib/db');
    // const { riskAssessments } = await import('@/lib/db/schema');

    const assessment = {
      id: 'ra_' + Math.random().toString(36).slice(2, 8),
      version: 1,
      assessorId: 'usr_placeholder',
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: assessment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
