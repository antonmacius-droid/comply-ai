import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const complianceCheckSchema = z.object({
  systemId: z.string().uuid().optional(),
  systemName: z.string().optional(),
  riskLevel: z.enum(['unacceptable', 'high', 'limited', 'minimal', 'gpai']).optional(),
  checks: z
    .array(
      z.enum([
        'risk_assessment',
        'technical_documentation',
        'conformity_assessment',
        'monitoring',
        'incident_reporting',
        'evidence',
      ])
    )
    .optional(),
});

interface CheckResult {
  check: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: string;
}

// POST /api/v1/compliance/check — run compliance checks (used by CLI)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = complianceCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // TODO: authenticate via API key, run actual checks against DB
    // This is the endpoint the CLI tool calls to verify compliance status

    const results: CheckResult[] = [
      {
        check: 'risk_assessment',
        status: 'pass',
        message: 'Valid risk assessment found (v3, approved)',
        details: 'Assessed 2026-03-15, risk level: high, category: Annex III 5(b)',
      },
      {
        check: 'technical_documentation',
        status: 'pass',
        message: 'Annex IV documentation present and approved',
        details: 'Version 3, approved 2026-03-10',
      },
      {
        check: 'conformity_assessment',
        status: 'warning',
        message: 'Conformity assessment in progress (72% complete)',
        details: '34 of 47 checklist items completed',
      },
      {
        check: 'monitoring',
        status: 'warning',
        message: 'Drift detection warning active',
        details: 'PSI: 0.18 exceeds threshold of 0.15',
      },
      {
        check: 'incident_reporting',
        status: 'pass',
        message: 'No unreported serious incidents',
      },
      {
        check: 'evidence',
        status: 'pass',
        message: '4 evidence artifacts linked',
        details: 'Training report, bias audit, data quality, benchmarks',
      },
    ];

    const requestedChecks = parsed.data.checks;
    const filteredResults = requestedChecks
      ? results.filter((r) => requestedChecks.includes(r.check as never))
      : results;

    const overallStatus = filteredResults.some((r) => r.status === 'fail')
      ? 'fail'
      : filteredResults.some((r) => r.status === 'warning')
      ? 'warning'
      : 'pass';

    const score = Math.round(
      (filteredResults.filter((r) => r.status === 'pass').length /
        filteredResults.length) *
        100
    );

    return NextResponse.json({
      data: {
        systemId: parsed.data.systemId || 'sys_001',
        systemName: parsed.data.systemName || 'Credit Scoring Model',
        overallStatus,
        complianceScore: score,
        checks: filteredResults,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run compliance check' },
      { status: 500 }
    );
  }
}
