import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  listAssessments,
  createAssessment,
  type CreateAssessmentInput,
} from '@/lib/services/risk-assessment.service';

const createAssessmentSchema = z.object({
  systemId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(10),
  purpose: z.string().min(10),
  category: z.string().optional(),
  isGeneralPurpose: z.boolean().optional(),
  usesRealTimeBiometrics: z.boolean().optional(),
  targetsDomain: z.string().optional(),
  affectsVulnerableGroups: z.boolean().optional(),
  makesAutonomousDecisions: z.boolean().optional(),
  processesPersonalData: z.boolean().optional(),
  isChatbot: z.boolean().optional(),
  generatesDeepfakes: z.boolean().optional(),
  interactsWithPersons: z.boolean().optional(),
  isSafetyComponent: z.boolean().optional(),
  trainingComputeFlops: z.number().optional(),
  euRegisteredUsers: z.number().optional(),
  performsSocialScoring: z.boolean().optional(),
  usesSubliminalTechniques: z.boolean().optional(),
  categorisesBySensitiveBiometrics: z.boolean().optional(),
  scrapesFacialImages: z.boolean().optional(),
  infersEmotionsAtWork: z.boolean().optional(),
  predictsCrimeBySoleProfiling: z.boolean().optional(),
  hasLawEnforcementExemption: z.boolean().optional(),
});

// GET /api/v1/assessments — list risk assessments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');

    const assessments = await listAssessments(systemId ?? undefined);

    return NextResponse.json({ data: assessments, total: assessments.length });
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

    const { systemId, ...inputData } = parsed.data;

    const assessment = await createAssessment(systemId, inputData as CreateAssessmentInput);

    return NextResponse.json({ data: assessment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
