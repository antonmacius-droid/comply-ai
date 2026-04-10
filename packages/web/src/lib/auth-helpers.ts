/**
 * Auth helpers for API routes.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Get the current user's org ID from the session.
 * Returns "default" if no session (for development without auth).
 */
export async function getOrgId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { orgId?: string })?.orgId || "default";
  } catch {
    return "default";
  }
}

/**
 * Get the current user's ID from the session.
 */
export async function getUserId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as { id?: string })?.id || "anonymous";
  } catch {
    return "anonymous";
  }
}
