import { NextRequest, NextResponse } from 'next/server';
import {
  getDocument,
  exportDocument,
} from '@/lib/services/document.service';

// POST /api/v1/documents/:id/export — generate export
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const exportResult = exportDocument(id);

    if (!exportResult) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        documentId: id,
        status: 'completed',
        format: exportResult.metadata.format,
        completionPercentage: exportResult.completionPercentage,
        totalSections: exportResult.totalSections,
        completedSections: exportResult.completedSections,
        exportedAt: exportResult.exportedAt,
        document: exportResult.document,
      },
    }, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to initiate export' },
      { status: 500 }
    );
  }
}

// GET /api/v1/documents/:id/export — check export status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = getDocument(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if an export has been generated (use exportDocument to get stats)
    const exportResult = exportDocument(id);

    return NextResponse.json({
      data: {
        documentId: id,
        status: exportResult ? 'available' : 'not_started',
        completionPercentage: exportResult?.completionPercentage ?? 0,
        totalSections: exportResult?.totalSections ?? 0,
        completedSections: exportResult?.completedSections ?? 0,
        message: exportResult
          ? `Document ready for export (${exportResult.completionPercentage}% complete)`
          : 'No export available. Use POST to generate.',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to check export status' },
      { status: 500 }
    );
  }
}
