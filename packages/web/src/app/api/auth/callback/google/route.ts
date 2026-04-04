import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserByEmail,
  getUserByGoogleId,
  updateUser,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3400";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[Google Auth] Token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/login?error=google_token_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenRes.json();

    // Get user info
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_userinfo_failed`);
    }

    const googleUser: GoogleUserInfo = await userInfoRes.json();

    // Find or create user
    let user = getUserByGoogleId(googleUser.sub);

    if (!user) {
      // Check if a user with this email exists (registered with password)
      const existingByEmail = getUserByEmail(googleUser.email);
      if (existingByEmail) {
        // Link Google account to existing user
        updateUser(existingByEmail.id, { google_id: googleUser.sub });
        user = { ...existingByEmail, google_id: googleUser.sub };
      } else {
        // Create new user
        user = createUser(
          googleUser.email,
          undefined,
          googleUser.name,
          googleUser.sub
        );
      }
    }

    // Create session
    const session = createSession(user.id);
    await setSessionCookie(session.token);

    return NextResponse.redirect(`${baseUrl}/registry`);
  } catch (err) {
    console.error("[Google Auth] Error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_error`);
  }
}
