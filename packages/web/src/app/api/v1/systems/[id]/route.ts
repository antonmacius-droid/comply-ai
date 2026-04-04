import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateSystemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  purpose: z.string().optional(),
  riskLevel: z.enum(['unacceptable', 'high', 'limited', 'minimal', 'gpai']).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  providerType: z.string().max(128).optional(),
  modelName: z.string().max(255).optional(),
  deploymentType: z.string().max(64).optional(),
  metadata: z.record(z.unknown()).optional(),
  bulwarkGatewayId: z.string().max(128).optional(),
});

// GET /api/v1/systems/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: authenticate, fetch from DB
    // const { db } = await import('@/lib/db');
    // const { aiSystems } = await import('@/lib/db/schema');
    // const system = await db.query.aiSystems.findFirst({ where: eq(aiSystems.id, id) });

    const system = {
      id,
      name: 'Credit Scoring Model',
      description: 'ML model for automated credit scoring decisions',
      purpose: 'Automated credit scoring affecting access to financial services',
      riskLevel: 'high',
      status: 'active',
      providerType: 'Internal',
      modelName: 'XGBoost v3',
      deploymentType: 'cloud',
      metadata: {},
      createdAt: '2025-06-15T00:00:00Z',
      updatedAt: '2026-03-15T00:00:00Z',
    };

    return NextResponse.json({ data: system });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch system' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/systems/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSystemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // TODO: authenticate, update in DB
    // const { db } = await import('@/lib/db');
    // const { aiSystems } = await import('@/lib/db/schema');
    // const [updated] = await db.update(aiSystems).set({ ...parsed.data, updatedAt: new Date() }).where(eq(aiSystems.id, id)).returning();

    const system = {
      id,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: system });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update system' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/systems/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: authenticate, soft-delete or archive
    // const { db } = await import('@/lib/db');
    // const { aiSystems } = await import('@/lib/db/schema');
    // await db.update(aiSystems).set({ status: 'archived' }).where(eq(aiSystems.id, id));

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete system' },
      { status: 500 }
    );
  }
}
