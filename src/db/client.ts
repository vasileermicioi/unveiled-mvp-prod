import { Client, neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleNeonServerless } from "drizzle-orm/neon-serverless";

import * as schema from "@/db/schema";
import { getRequiredEnv, type RuntimeEnv } from "@/lib/env";

type DatabaseDriver = "neon-serverless" | "neon-http";

const connectionPools = new Set<Pool>();

function databaseDriver(env?: RuntimeEnv): DatabaseDriver {
  const value =
    env?.DATABASE_DRIVER ??
    process.env.DATABASE_DRIVER ??
    process.env.DB_DRIVER ??
    "neon-http";
  return value === "neon-serverless" ? "neon-serverless" : "neon-http";
}

function createPool(databaseUrl: string, max = 10) {
  const pool = new Pool({ connectionString: databaseUrl, max });
  connectionPools.add(pool);
  return pool;
}

export function createDb(env?: RuntimeEnv) {
  const databaseUrl = getRequiredEnv("DATABASE_URL", env);
  if (databaseDriver(env) === "neon-http") {
    const sql = neon(databaseUrl);
    const mainDb = drizzle(sql, { schema });
    // Override the transaction method to support transactions in neon-http mode
    // by using a transient, self-closing WebSocket connection.
    mainDb.transaction = (async (
      transactionCallback: Parameters<typeof mainDb.transaction>[0],
      config?: Parameters<typeof mainDb.transaction>[1],
    ) => {
      const client = new Client({ connectionString: databaseUrl });
      await client.connect();
      try {
        const txDb = drizzleNeonServerless(client, { schema });
        return await (txDb.transaction as unknown as typeof mainDb.transaction)(
          transactionCallback,
          config,
        );
      } finally {
        await client.end();
      }
    }) as unknown as typeof mainDb.transaction;
    return mainDb;
  }

  const pool = createPool(databaseUrl);
  return drizzleNeonServerless(pool, { schema }) as unknown as Database;
}

type Database = ReturnType<typeof drizzle<typeof schema>>;

const dbClientsCache = new Map<string, Database>();

export function getDb(env?: RuntimeEnv): Database {
  if (env) return createDb(env);

  const databaseUrl = getRequiredEnv("DATABASE_URL");
  let cached = dbClientsCache.get(databaseUrl);
  if (!cached) {
    cached = createDb();
    dbClientsCache.set(databaseUrl, cached);
  }
  return cached;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export const postgresClient = {
  async end() {
    await Promise.all([...connectionPools].map((pool) => pool.end()));
    connectionPools.clear();
    dbClientsCache.clear();
  },
};

export type Db = Database;

export async function checkDatabaseConnection(env?: RuntimeEnv) {
  const databaseUrl = getRequiredEnv("DATABASE_URL", env);
  if (databaseDriver(env) === "neon-http") {
    const sql = neon(databaseUrl);
    await sql`select 1`;
    return;
  }

  const pool = createPool(databaseUrl, 1);
  try {
    await pool.query("select 1");
  } finally {
    await pool.end();
    connectionPools.delete(pool);
  }
}
