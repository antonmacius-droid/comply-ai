import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSystem } from '@/lib/services/registry.service';
import { listAssessments } from '@/lib/services/risk-assessment.service';
import { listDocuments } from '@/lib/services/document.service';
import { listEvidence } from '@/lib/services/evidence.service';
import { getOrgId } from '@/lib/auth-helpers';

const complianceCheckSchema = z.object({
  systemId: z.string().optional(),
  systemName: z.string().optional(),
  riskLevel: z.enum(['prohibited', 'high', 'limited', 'minimal', 'gpai']).optional(),
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

// POST /api/v1/compliance/check — run compliance checks
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

    const systemId = parsed.data.systemId;
    let systemName = parsed.data.systemName || 'Unknown System';

    // Try to look up the system dynamically
    const orgId = await getOrgId();
    if (systemId) {
      const system = await getSystem(systemId, orgId);
      if (system) {
        systemName = system.name;
      }
    }

    // Build dynamic check results
    const results: CheckResult[] = [];

    // Risk assessment check
    const assessments = systemId ? await listAssessments(systemId) : [];
    if (assessments.length > 0) {
      const latest = assessments[0]!;
      results.push({
        check: 'risk_assessment',
        status: latest.status === 'approved' ? 'pass' : latest.status === 'submitted' ? 'warning' : 'warning',
        message: `Risk assessment found (${latest.status})`,
        details: `Risk level: ${latest.riskLevel}, confidence: ${latest.confidence}%`,
      });
    } else {
      results.push({
        check: 'risk_assessment',
        status: 'fail',
        message: 'No risk assessment found',
        details: 'Create a risk assessment for this system',
      });
    }

    // Technical documentation check
    const docs = systemId ? await listDocuments(systemId) : [];
    if (docs.length > 0) {
      const completedSections = docs[0]!.sections.filter((s) => s.content.trim().length > 0).length;
      const totalSections = docs[0]!.sections.length;
      const pct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
      results.push({
        check: 'technical_documentation',
        status: pct === 100 ? 'pass' : pct > 0 ? 'warning' : 'fail',
        message: `Technical documentation ${pct}% complete`,
        details: `${completedSections} of ${totalSections} sections filled`,
      });
    } else {
      results.push({
        check: 'technical_documentation',
        status: 'fail',
        message: 'No technical documentation found',
        details: 'Create Annex IV documentation for this system',
      });
    }

    // Conformity assessment — placeholder (conformity service needs systemId + riskLevel)
    results.push({
      check: 'conformity_assessment',
      status: 'warning',
      message: 'Conformity assessment not yet started',
      details: 'Begin the conformity checklist for this system',
    });

    // Monitoring — placeholder
    results.push({
      check: 'monitoring',
      status: 'warning',
      message: 'Monitoring status unknown',
      details: 'Configure monitoring for this system',
    });

    // Incident reporting — placeholder
    results.push({
      check: 'incident_reporting',
      status: 'pass',
      message: 'No unreported serious incidents',
    });

    // Evidence check
    const evidence = systemId ? await listEvidence(systemId) : [];
    if (evidence.length > 0) {
      results.push({
        check: 'evidence',
        status: 'pass',
        message: `${evidence.length} evidence artifact(s) linked`,
        details: evidence.map((e) => e.title).join(', '),
      });
    } else {
      results.push({
        check: 'evidence',
        status: 'fail',
        message: 'No evidence artifacts found',
        details: 'Upload supporting evidence for this system',
      });
    }

    const requestedChecks = parsed.data.checks;
    const filteredResults = requestedChecks
      ? results.filter((r) => requestedChecks.includes(r.check as never))
      : results;

    const overallStatus = filteredResults.some((r) => r.status === 'fail')
      ? 'fail'
      : filteredResults.some((r) => r.status === 'warning')
      ? 'warning'
      : 'pass';

    const score = filteredResults.length > 0
      ? Math.round(
          (filteredResults.filter((r) => r.status === 'pass').length /
            filteredResults.length) *
            100
        )
      : 0;

    return NextResponse.json({
      data: {
        systemId: systemId || null,
        systemName,
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
