import { NextRequest, NextResponse } from "next/server";
import {
  listIncidents,
  createIncident,
  getOverdueIncidents,
} from "@/lib/services/incident.service";
import type { IncidentSeverity } from "@comply-ai/core";

// GET /api/v1/incidents — list all incidents, optionally filtered
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get("systemId") ?? undefined;
    const overdueOnly = searchParams.get("overdue") === "true";

    if (overdueOnly) {
      const overdue = getOverdueIncidents();
      return NextResponse.json({ data: overdue, total: overdue.length });
    }

    const incidents = listIncidents(systemId);
    return NextResponse.json({ data: incidents, total: incidents.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

// POST /api/v1/incidents — create a new incident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { systemId, severity, title, description, reportedBy, affectedUsers } =
      body as {
        systemId?: string;
        severity?: IncidentSeverity;
        title?: string;
        description?: string;
        reportedBy?: string;
        affectedUsers?: number;
      };

    if (!systemId || !severity || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: systemId, severity, title, description" },
        { status: 400 }
      );
    }

    const incident = createIncident(systemId, {
      severity,
      title,
      description,
      reportedBy: reportedBy || "unknown",
      affectedUsers,
    });

    return NextResponse.json({ data: incident }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
