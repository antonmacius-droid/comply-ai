import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOrCreateAssessment,
  getProgress,
  updateChecklistItem,
  type ChecklistItemStatus,
} from '@/lib/services/conformity.service';
import type { RiskLevel } from '@comply-ai/core';

const updateChecklistItemSchema = z.object({
  itemId: z.string().min(1),
  status: z.enum(['not_started', 'in_progress', 'compliant', 'non_compliant', 'not_applicable']).optional(),
  notes: z.string().max(2000).optional(),
  evidenceIds: z.array(z.string()).optional(),
});

const updateChecklistSchema = z.object({
  items: z.array(updateChecklistItemSchema),
});

// GET /api/v1/conformity/:systemId — get conformity checklist for a system
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params;
    const { searchParams } = new URL(request.url);
    const riskLevel = (searchParams.get('riskLevel') as RiskLevel) || 'high';

    const assessment = getOrCreateAssessment(systemId, riskLevel);
    const progress = getProgress(assessment.id);

    return NextResponse.json({
      data: {
        systemId,
        assessmentId: assessment.id,
        riskLevel: assessment.riskLevel,
        checklistTitle: assessment.checklistTitle,
        items: assessment.items,
        stats: progress
          ? {
              total: progress.totalItems,
              compliant: progress.compliant,
              nonCompliant: progress.nonCompliant,
              inProgress: progress.inProgress,
              notStarted: progress.notStarted,
              notApplicable: progress.notApplicable,
              overallPercentage: progress.overallPercentage,
              byArticle: progress.byArticle,
            }
          : null,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      },
    });
  } catch (error) {
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

    // Get or create the assessment for this system
    const assessment = getOrCreateAssessment(systemId);

    // Update each item
    let latestAssessment = assessment;
    for (const item of parsed.data.items) {
      if (item.status) {
        const updated = updateChecklistItem(
          assessment.id,
          item.itemId,
          item.status as ChecklistItemStatus,
          item.notes
        );
        if (updated) {
          latestAssessment = updated;
        }
      }
    }

    const progress = getProgress(assessment.id);

    return NextResponse.json({
      data: {
        systemId,
        assessmentId: latestAssessment.id,
        updatedItems: parsed.data.items.length,
        stats: progress,
        updatedAt: latestAssessment.updatedAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update conformity checklist';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
