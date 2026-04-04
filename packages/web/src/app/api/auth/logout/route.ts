import { NextResponse } from "next/server";
import {
  getSessionCookie,
  destroySession,
  clearSessionCookie,
} from "@/lib/auth";

export async function POST() {
  try {
    const token = await getSessionCookie();
    if (token) {
      destroySession(token);
    }
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Logout]", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
