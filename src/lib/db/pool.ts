import "server-only";

import { Pool, types } from "pg";

// Match the JSON shapes PostgREST used to return so existing code keeps working:
// dates stay "YYYY-MM-DD", timestamps are ISO strings, numerics are numbers.
types.setTypeParser(1082, (v: string) => v); // date
types.setTypeParser(1083, (v: string) => v); // time
types.setTypeParser(1114, (v: string) => (v ? v.replace(" ", "T") : v)); // timestamp
types.setTypeParser(1184, (v: string) => {
  // timestamptz "2026-06-17 12:34:56.789+00" -> "2026-06-17T12:34:56.789+00:00"
  if (!v) return v;
  return v.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
});
types.setTypeParser(1700, (v: string | null) => (v === null ? null : Number(v))); // numeric
types.setTypeParser(20, (v: string | null) => (v === null ? null : Number(v))); // int8

const globalForPool = globalThis as unknown as { bbPgPool?: Pool };

export function getPool(): Pool {
  if (globalForPool.bbPgPool) return globalForPool.bbPgPool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set, so the database cannot be reached.");
  }
  // Each store role is capped at 10 server connections (fleet standard). The
  // build prerenders with ~9 workers, so each gets a single connection.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || (isBuild ? 1 : 5)),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined
  });
  pool.on("error", (err) => {
    console.error("[db] idle client error", err);
  });
  globalForPool.bbPgPool = pool;
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const res = await getPool().query(text, params as unknown[]);
  return { rows: res.rows as T[], rowCount: res.rowCount ?? 0 };
}
