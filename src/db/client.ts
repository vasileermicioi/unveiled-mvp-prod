import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { getRequiredEnv, type RuntimeEnv } from "@/lib/env";

export function createDb(env?: RuntimeEnv) {
  const databaseUrl = getRequiredEnv("DATABASE_URL", env);
  const sql = neon(databaseUrl);

  return drizzle(sql, { schema });
}

type Database = ReturnType<typeof createDb>;

let defaultDb: Database | undefined;

export function getDb(env?: RuntimeEnv): Database {
  if (env) return createDb(env);

  defaultDb ??= createDb();
  return defaultDb;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export const postgresClient = {
  async end() {
    // Neon HTTP does not keep a local TCP pool open, but existing scripts call
    // postgresClient.end() after finishing.
  },
};

export type Db = Database;

export async function checkDatabaseConnection(env?: RuntimeEnv) {
  const databaseUrl = getRequiredEnv("DATABASE_URL", env);
  const sql = neon(databaseUrl);
  await sql`select 1`;
}
