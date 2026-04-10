import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  listSystems,
  createSystem,
  type ListSystemsFilter,
} from '@/lib/services/registry.service';
import { getOrgId } from '@/lib/auth-helpers';

// Validation schema for creating an AI system
const createSystemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  purpose: z.string().optional(),
  riskLevel: z.enum(['prohibited', 'high', 'limited', 'minimal', 'gpai']).optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  providerType: z.string().max(128).optional(),
  modelName: z.string().max(255).optional(),
  deploymentType: z.string().max(64).optional(),
  metadata: z.record(z.unknown()).optional(),
  bulwarkGatewayId: z.string().max(128).optional(),
});

// GET /api/v1/systems — list all AI systems for the org
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ListSystemsFilter['status'] | null;
    const riskLevel = searchParams.get('riskLevel') as ListSystemsFilter['riskLevel'] | null;
    const search = searchParams.get('search');

    const filter: ListSystemsFilter = {};
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (search) filter.search = search;

    const orgId = await getOrgId();
    const systems = await listSystems(orgId, filter);

    return NextResponse.json({ data: systems, total: systems.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch systems' },
      { status: 500 }
    );
  }
}

// POST /api/v1/systems — register a new AI system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSystemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const orgId = await getOrgId();
    const system = await createSystem(
      {
        name: parsed.data.name,
        description: parsed.data.description,
        provider: parsed.data.providerType || 'Unknown',
        version: '1.0.0',
        purpose: parsed.data.purpose || parsed.data.description || '',
        riskLevel: parsed.data.riskLevel,
      },
      orgId
    );

    return NextResponse.json({ data: system }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create system' },
      { status: 500 }
    );
  }
}
