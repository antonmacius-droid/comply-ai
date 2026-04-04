import { NextResponse } from "next/server";
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const session = createSession(user.id);
    await setSessionCookie(session.token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        trial_ends_at: user.trial_ends_at,
      },
    });
  } catch (error: any) {
    console.error("[Login]", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
