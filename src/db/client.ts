import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export const postgresClient = postgres(databaseUrl, {
  prepare: false,
});

export const db = drizzlePostgres(postgresClient, { schema });

export type Db = typeof db;
