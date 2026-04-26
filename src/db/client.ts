import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;
const pgliteDataDir = process.env.PGLITE_DATA_DIR ?? "./.data/pglite";

if (!databaseUrl) {
  mkdirSync(dirname(pgliteDataDir), { recursive: true });
}

export const db = databaseUrl
  ? drizzlePostgres(
      postgres(databaseUrl, {
        prepare: false,
      }),
      { schema },
    )
  : drizzlePglite(new PGlite(pgliteDataDir), {
      schema,
    });

export type Db = typeof db;
