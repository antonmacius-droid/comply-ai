import { NextRequest, NextResponse } from "next/server";
import {
  discoveryQueue,
  getDiscoveryResults,
  type DiscoveryInput,
} from "@/lib/jobs/discovery.job";

// GET /api/v1/discovery — get previous discovery scan results
export async function GET() {
  try {
    const results = getDiscoveryResults();
    return NextResponse.json({ data: results, total: results.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch discovery results" },
      { status: 500 }
    );
  }
}

// POST /api/v1/discovery — trigger a new discovery scan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubToken, org, existingSystemIds } = body as Partial<DiscoveryInput>;

    if (!org) {
      return NextResponse.json(
        { error: "Missing required field: org (GitHub organization name)" },
        { status: 400 }
      );
    }

    const job = await discoveryQueue.add("scan", {
      githubToken: githubToken || "mock_token",
      org,
      existingSystemIds: existingSystemIds || [],
    });

    // Since in dev mode jobs execute inline, we can return results immediately
    const results = getDiscoveryResults();
    const latest = results[0];

    return NextResponse.json(
      {
        data: {
          jobId: job.id,
          status: "completed",
          result: latest,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start discovery scan" },
      { status: 500 }
    );
  }
}
