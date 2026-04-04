import { getAuthDb } from "./db-auth";
import { hashSync, compareSync } from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "comply_session";
const SESSION_DAYS = 30;
const TRIAL_DAYS = 14;

export interface User {
  id: string;
  email: string;
  name: string | null;
  google_id: string | null;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UserWithPassword = User & { password_hash: string | null };

// ── Password ──────────────────────────────────────────
export function hashPassword(password: string): string {
  return hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

// ── Users ─────────────────────────────────────────────
export function createUser(
  email: string,
  passwordHash?: string,
  name?: string,
  googleId?: string
): User {
  const db = getAuthDb();
  const id = randomUUID();
  const trialEndsAt = new Date(
    Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, google_id, plan, trial_ends_at)
     VALUES (?, ?, ?, ?, ?, 'free', ?)`
  ).run(
    id,
    email.toLowerCase(),
    passwordHash || null,
    name || null,
    googleId || null,
    trialEndsAt
  );

  return getUserById(id)!;
}

export function getUserByEmail(
  email: string
): UserWithPassword | null {
  const db = getAuthDb();
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as UserWithPassword | null;
}

export function getUserById(id: string): User | null {
  const db = getAuthDb();
  return db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as User | null;
}

export function getUserByGoogleId(googleId: string): User | null {
  const db = getAuthDb();
  return db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .get(googleId) as User | null;
}

export function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    plan: string;
    google_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    trial_ends_at: string;
  }>
) {
  const db = getAuthDb();
  const fields = Object.entries(data).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return;
  const sets = fields.map(([k]) => `${k} = @${k}`).join(", ");
  db.prepare(
    `UPDATE users SET ${sets}, updated_at = datetime('now') WHERE id = @id`
  ).run({ ...data, id });
}

// ── Sessions ──────────────────────────────────────────
export function createSession(userId: string): {
  token: string;
  expiresAt: string;
} {
  const db = getAuthDb();
  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  db.prepare(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
  ).run(userId, token, expiresAt);
  return { token, expiresAt };
}

export function validateSession(token: string): User | null {
  const db = getAuthDb();
  const session = db
    .prepare(
      "SELECT user_id, expires_at FROM sessions WHERE token = ?"
    )
    .get(token) as { user_id: string; expires_at: string } | undefined;

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  return getUserById(session.user_id);
}

export function destroySession(token: string) {
  const db = getAuthDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

// ── Cookie helpers ────────────────────────────────────
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return validateSession(token);
}

export { COOKIE_NAME };
