import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateChecklistItemSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(['pending', 'compliant', 'non_compliant', 'na']).optional(),
  evidenceIds: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});

const updateChecklistSchema = z.object({
  items: z.array(updateChecklistItemSchema),
});

// Full checklist template matching the conformity page
function buildDefaultChecklist() {
  const items = [
    // Art. 9 Risk Management
    { id: 'a9_1', articleRef: 'Art. 9(1)', articleGroup: 'Art. 9 Risk Management', requirement: 'Risk management system established and maintained throughout entire lifecycle' },
    { id: 'a9_2', articleRef: 'Art. 9(2)(a)', articleGroup: 'Art. 9 Risk Management', requirement: 'Identification and analysis of known and reasonably foreseeable risks' },
    { id: 'a9_3', articleRef: 'Art. 9(2)(b)', articleGroup: 'Art. 9 Risk Management', requirement: 'Estimation and evaluation of risks during intended use and foreseeable misuse' },
    { id: 'a9_4', articleRef: 'Art. 9(2)(c)', articleGroup: 'Art. 9 Risk Management', requirement: 'Evaluation of risks based on post-market monitoring data' },
    { id: 'a9_5', articleRef: 'Art. 9(4)', articleGroup: 'Art. 9 Risk Management', requirement: 'Suitable risk management measures adopted to address identified risks' },
    { id: 'a9_6', articleRef: 'Art. 9(5)', articleGroup: 'Art. 9 Risk Management', requirement: 'Testing procedures established to ensure consistent performance' },
    { id: 'a9_7', articleRef: 'Art. 9(7)', articleGroup: 'Art. 9 Risk Management', requirement: 'Residual risks communicated to deployers and documented' },

    // Art. 10 Data Governance
    { id: 'a10_1', articleRef: 'Art. 10(1)', articleGroup: 'Art. 10 Data Governance', requirement: 'Data governance and management practices established' },
    { id: 'a10_2', articleRef: 'Art. 10(2)(a)', articleGroup: 'Art. 10 Data Governance', requirement: 'Design choices and data collection processes documented' },
    { id: 'a10_3', articleRef: 'Art. 10(2)(b)', articleGroup: 'Art. 10 Data Governance', requirement: 'Data preparation processes documented' },
    { id: 'a10_4', articleRef: 'Art. 10(2)(f)', articleGroup: 'Art. 10 Data Governance', requirement: 'Examination for biases, gaps, and deficiencies in datasets' },
    { id: 'a10_5', articleRef: 'Art. 10(3)', articleGroup: 'Art. 10 Data Governance', requirement: 'Datasets are relevant, representative, and error-free' },
    { id: 'a10_6', articleRef: 'Art. 10(5)', articleGroup: 'Art. 10 Data Governance', requirement: 'Personal data processing with appropriate safeguards' },

    // Art. 11 Technical Documentation
    { id: 'a11_1', articleRef: 'Art. 11(1)', articleGroup: 'Art. 11 Technical Documentation', requirement: 'Technical documentation drawn up before market placement' },
    { id: 'a11_2', articleRef: 'Art. 11(1)', articleGroup: 'Art. 11 Technical Documentation', requirement: 'Documentation compliant with Annex IV requirements' },
    { id: 'a11_3', articleRef: 'Art. 11(2)', articleGroup: 'Art. 11 Technical Documentation', requirement: 'Documentation kept up-to-date on significant modifications' },

    // Art. 12 Record-Keeping
    { id: 'a12_1', articleRef: 'Art. 12(1)', articleGroup: 'Art. 12 Record-Keeping', requirement: 'Automatic logging capabilities for recording events' },
    { id: 'a12_2', articleRef: 'Art. 12(2)', articleGroup: 'Art. 12 Record-Keeping', requirement: 'Logging includes usage period, reference database, input data' },
    { id: 'a12_3', articleRef: 'Art. 12(4)', articleGroup: 'Art. 12 Record-Keeping', requirement: 'Logs retained for appropriate period' },

    // Art. 13 Transparency
    { id: 'a13_1', articleRef: 'Art. 13(1)', articleGroup: 'Art. 13 Transparency', requirement: 'System designed for sufficient operational transparency' },
    { id: 'a13_2', articleRef: 'Art. 13(2)', articleGroup: 'Art. 13 Transparency', requirement: 'Instructions for use provided in appropriate format' },
    { id: 'a13_3', articleRef: 'Art. 13(3)(a)', articleGroup: 'Art. 13 Transparency', requirement: 'Provider identity and contact details documented' },
    { id: 'a13_4', articleRef: 'Art. 13(3)(b)', articleGroup: 'Art. 13 Transparency', requirement: 'System characteristics and limitations documented for deployers' },

    // Art. 14 Human Oversight
    { id: 'a14_1', articleRef: 'Art. 14(1)', articleGroup: 'Art. 14 Human Oversight', requirement: 'System designed for effective human oversight' },
    { id: 'a14_2', articleRef: 'Art. 14(2)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Oversight measures identified and built into system' },
    { id: 'a14_3', articleRef: 'Art. 14(3)(a)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Overseers can understand system capabilities and limitations' },
    { id: 'a14_4', articleRef: 'Art. 14(3)(d)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Ability to override or reverse AI output' },
    { id: 'a14_5', articleRef: 'Art. 14(4)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Measures proportionate to risks and context' },

    // Art. 15 Accuracy, Robustness, Cybersecurity
    { id: 'a15_1', articleRef: 'Art. 15(1)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Appropriate accuracy, robustness, and cybersecurity levels' },
    { id: 'a15_2', articleRef: 'Art. 15(2)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Accuracy metrics declared in instructions of use' },
    { id: 'a15_3', articleRef: 'Art. 15(3)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'System resilient to errors and inconsistencies' },
    { id: 'a15_4', articleRef: 'Art. 15(4)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Technical redundancy and fail-safe plans' },
    { id: 'a15_5', articleRef: 'Art. 15(5)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Cybersecurity measures for identified vulnerabilities' },
  ];

  return items.map((item) => ({
    ...item,
    status: 'pending' as const,
    evidenceIds: [] as string[],
    notes: '',
  }));
}

// GET /api/v1/conformity/:systemId — get conformity checklist for a system
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params;

    // TODO: authenticate and fetch from DB
    const checklist = {
      systemId,
      systemName: 'Credit Scoring Model',
      riskLevel: 'high',
      items: buildDefaultChecklist(),
      stats: {
        total: 33,
        compliant: 0,
        nonCompliant: 0,
        pending: 33,
        na: 0,
      },
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
    };

    // Compute stats
    const s = (status: string) => checklist.items.filter((i) => (i.status as string) === status).length;
    checklist.stats.compliant = s('compliant');
    checklist.stats.nonCompliant = s('non_compliant');
    checklist.stats.pending = s('pending');
    checklist.stats.na = s('na');

    return NextResponse.json({ data: checklist });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch conformity checklist' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/conformity/:systemId — update checklist items
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params;
    const body = await request.json();
    const parsed = updateChecklistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // TODO: authenticate, fetch existing checklist, merge updates, persist
    // For each item in parsed.data.items:
    //   - Update status if provided
    //   - Update evidenceIds if provided
    //   - Update notes if provided

    const updatedItems = parsed.data.items.map((item) => ({
      ...item,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      data: {
        systemId,
        updatedItems,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update conformity checklist' },
      { status: 500 }
    );
  }
}
