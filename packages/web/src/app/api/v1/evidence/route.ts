import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  listEvidence,
  uploadEvidence,
  type UploadEvidenceInput,
} from '@/lib/services/evidence.service';

const createEvidenceSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  systemId: z.string().min(1),
  type: z.enum(['document', 'test_result', 'audit_log', 'certification', 'policy', 'procedure', 'training_record', 'monitoring_report', 'technical_spec', 'third_party_audit']).default('document'),
  fileName: z.string().min(1).optional(),
  fileUrl: z.string().optional(),
  fileHash: z.string().optional(),
  fileSizeBytes: z.number().positive().optional(),
  uploadedBy: z.string().default('system'),
  expiresAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// GET /api/v1/evidence — list all evidence artifacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    const evidence = listEvidence(systemId ?? undefined);

    return NextResponse.json({ data: evidence, total: evidence.length });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

// POST /api/v1/evidence — upload a new evidence artifact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEvidenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { systemId, ...inputData } = parsed.data;

    const evidence = uploadEvidence(systemId, inputData as UploadEvidenceInput);

    return NextResponse.json({ data: evidence }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}
