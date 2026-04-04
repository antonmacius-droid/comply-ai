import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createEvidenceSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  systemId: z.string().min(1),
  assessmentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  fileType: z.string().min(1),
});

// GET /api/v1/evidence — list all evidence artifacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');
    const assessmentId = searchParams.get('assessmentId');

    // TODO: authenticate and query DB
    const evidence = [
      {
        id: 'ev_001',
        title: 'Training Data Quality Report',
        description: 'Comprehensive data quality assessment for the credit scoring training dataset.',
        fileName: 'training_data_quality_report_v3.pdf',
        fileSize: 2457600,
        fileType: 'application/pdf',
        systemId: 'sys_001',
        assessmentId: 'ra_001',
        tags: ['data-quality', 'training', 'audit'],
        uploadedBy: 'Maria L.',
        sha256: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
        createdAt: '2026-03-28T14:30:00Z',
      },
      {
        id: 'ev_002',
        title: 'Bias Testing Results',
        description: 'Results of fairness and bias testing across protected characteristics.',
        fileName: 'bias_testing_results_march2026.xlsx',
        fileSize: 891200,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        systemId: 'sys_001',
        assessmentId: 'ra_001',
        tags: ['bias', 'fairness', 'testing'],
        uploadedBy: 'Jan D.',
        sha256: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
        createdAt: '2026-03-25T10:15:00Z',
      },
      {
        id: 'ev_003',
        title: 'Human Oversight Protocol',
        description: 'Documentation of human-in-the-loop oversight procedures.',
        fileName: 'human_oversight_protocol_v2.docx',
        fileSize: 340800,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        systemId: 'sys_003',
        assessmentId: null,
        tags: ['oversight', 'protocol'],
        uploadedBy: 'Anton K.',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdAt: '2026-03-22T09:00:00Z',
      },
    ];

    let filtered = evidence;
    if (systemId) filtered = filtered.filter((e) => e.systemId === systemId);
    if (assessmentId) filtered = filtered.filter((e) => e.assessmentId === assessmentId);

    return NextResponse.json({ data: filtered, total: filtered.length });
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
    // In production, this would handle multipart form data with file upload
    // For now, accept JSON metadata (file would be uploaded to S3/R2 separately)
    const body = await request.json();
    const parsed = createEvidenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Generate a fake SHA-256 hash (in production, compute from actual file)
    const chars = '0123456789abcdef';
    const sha256 = Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join('');

    const evidence = {
      id: 'ev_' + Math.random().toString(36).slice(2, 8),
      ...parsed.data,
      uploadedBy: 'Anton K.',
      sha256,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: evidence }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}
