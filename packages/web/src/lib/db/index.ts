import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString) {
  const client = postgres(connectionString);
  _db = drizzle(client, { schema });
}

/**
 * Get the database connection. Returns null if DATABASE_URL is not set.
 * Services should fall back to in-memory storage when db is null.
 */
export const db = _db;

/** Check if Postgres is connected */
export function isDbConnected(): boolean {
  return _db !== null;
}
