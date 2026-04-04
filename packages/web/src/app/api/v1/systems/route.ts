import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for creating an AI system
const createSystemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  purpose: z.string().optional(),
  riskLevel: z.enum(['unacceptable', 'high', 'limited', 'minimal', 'gpai']).default('minimal'),
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
    // TODO: authenticate and extract org_id from session
    // const { db } = await import('@/lib/db');
    // const { aiSystems } = await import('@/lib/db/schema');
    // const systems = await db.select().from(aiSystems).where(eq(aiSystems.orgId, orgId));

    // Placeholder response
    const systems = [
      {
        id: 'sys_001',
        name: 'Credit Scoring Model',
        description: 'ML model for automated credit scoring',
        riskLevel: 'high',
        status: 'active',
        providerType: 'Internal',
        modelName: 'XGBoost v3',
        deploymentType: 'cloud',
        createdAt: '2025-06-15T00:00:00Z',
        updatedAt: '2026-03-15T00:00:00Z',
      },
      {
        id: 'sys_002',
        name: 'Customer Support Chatbot',
        description: 'AI-powered customer support',
        riskLevel: 'limited',
        status: 'active',
        providerType: 'OpenAI',
        modelName: 'GPT-4o',
        deploymentType: 'cloud',
        createdAt: '2025-09-01T00:00:00Z',
        updatedAt: '2026-02-20T00:00:00Z',
      },
    ];

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

    // TODO: authenticate, extract org_id, insert into DB
    // const { db } = await import('@/lib/db');
    // const { aiSystems } = await import('@/lib/db/schema');
    // const [system] = await db.insert(aiSystems).values({ ...parsed.data, orgId }).returning();

    const system = {
      id: 'sys_' + Math.random().toString(36).slice(2, 8),
      ...parsed.data,
      orgId: 'org_placeholder',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: system }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create system' },
      { status: 500 }
    );
  }
}
