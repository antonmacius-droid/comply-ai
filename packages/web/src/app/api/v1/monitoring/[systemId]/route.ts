import { NextRequest, NextResponse } from "next/server";
import {
  listChecks,
  runCheck,
  getSystemHealth,
  type MonitoringCheckType,
} from "@/lib/services/monitoring.service";

const VALID_CHECK_TYPES: MonitoringCheckType[] = [
  "accuracy_drift",
  "bias_detection",
  "performance_degradation",
  "data_quality",
  "security_scan",
  "uptime",
  "error_rate",
  "latency",
];

// GET /api/v1/monitoring/[systemId] — get checks and health for a system
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params;

    const health = getSystemHealth(systemId);
    const checks = listChecks(systemId);

    return NextResponse.json({
      data: {
        health,
        checks,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch monitoring data" },
      { status: 500 }
    );
  }
}

// POST /api/v1/monitoring/[systemId] — run a monitoring check
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params;
    const body = await request.json();
    const { checkType, checkTypes } = body as {
      checkType?: MonitoringCheckType;
      checkTypes?: MonitoringCheckType[];
    };

    // Run a single check or multiple checks
    const typesToRun = checkTypes ?? (checkType ? [checkType] : []);

    if (typesToRun.length === 0) {
      return NextResponse.json(
        {
          error: "Provide checkType or checkTypes",
          validTypes: VALID_CHECK_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate check types
    for (const ct of typesToRun) {
      if (!VALID_CHECK_TYPES.includes(ct)) {
        return NextResponse.json(
          {
            error: `Invalid check type: ${ct}`,
            validTypes: VALID_CHECK_TYPES,
          },
          { status: 400 }
        );
      }
    }

    const results = typesToRun.map((ct) => runCheck(systemId, ct));

    return NextResponse.json({
      data: {
        systemId,
        checksRun: results.length,
        results,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to run monitoring check" },
      { status: 500 }
    );
  }
}
