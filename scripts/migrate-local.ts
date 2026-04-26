import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const pgliteDataDir = process.env.PGLITE_DATA_DIR ?? "./.data/pglite";

await mkdir(dirname(pgliteDataDir), { recursive: true });

const client = new PGlite(pgliteDataDir);
const db = drizzle(client);

await migrate(db, {
  migrationsFolder: "drizzle",
});

await client.close();
