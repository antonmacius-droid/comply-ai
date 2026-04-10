import { NextRequest, NextResponse } from "next/server";
import {
  getIncident,
  updateIncident,
  escalateIncident,
  getIncidentTimeline,
  calculateNotificationDeadline,
} from "@/lib/services/incident.service";

// GET /api/v1/incidents/[id] — get incident details with timeline
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await getIncident(id);

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const timeline = await getIncidentTimeline(id);
    const deadline = calculateNotificationDeadline(incident);

    return NextResponse.json({
      data: {
        ...incident,
        timeline,
        notificationDeadline: deadline,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/incidents/[id] — update an incident
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateIncident(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

// POST /api/v1/incidents/[id] — actions: escalate, resolve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body as { action: string; [key: string]: unknown };

    if (action === "escalate") {
      const result = await escalateIncident(id, (data.escalatedBy as string) || "system");
      if (!result) {
        return NextResponse.json({ error: "Incident not found" }, { status: 404 });
      }
      return NextResponse.json({ data: result });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
