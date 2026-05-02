import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export const db = drizzlePostgres(
  postgres(databaseUrl, {
    prepare: false,
  }),
  { schema },
);

export type Db = typeof db;
