import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSystem,
  updateSystem,
  deleteSystem,
} from '@/lib/services/registry.service';

const orgId = 'default';

const updateSystemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  purpose: z.string().optional(),
  riskLevel: z.enum(['prohibited', 'high', 'limited', 'minimal', 'gpai']).optional(),
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
    const system = getSystem(id, orgId);

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

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

    // Map route fields to service fields
    const serviceData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) serviceData.name = parsed.data.name;
    if (parsed.data.description !== undefined) serviceData.description = parsed.data.description;
    if (parsed.data.purpose !== undefined) serviceData.purpose = parsed.data.purpose;
    if (parsed.data.riskLevel !== undefined) serviceData.riskLevel = parsed.data.riskLevel;
    if (parsed.data.providerType !== undefined) serviceData.provider = parsed.data.providerType;

    const system = updateSystem(id, serviceData, orgId);

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

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
    const deleted = deleteSystem(id, orgId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete system' },
      { status: 500 }
    );
  }
}
