import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { Pool } from "@neondatabase/serverless";
import * as apiSchema from "@unveiled/api/db/schema";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

if (!DATABASE_URL) {
  throw new Error(
    "seed-operations-smoke unit test requires DATABASE_URL to be set.",
  );
}

const SEED_PREFIX = "pagination-";
const SEED_USER_IDS = [
  `${SEED_PREFIX}admin-`,
  `${SEED_PREFIX}partner-`,
  `${SEED_PREFIX}user-`,
];
const SEED_PARTNER_IDS = [`${SEED_PREFIX}partner-`];
const SEED_EVENT_IDS = [`${SEED_PREFIX}event-`];
const SEED_BOOKING_IDS = [`${SEED_PREFIX}booking-`];
const SEED_SUBSCRIPTION_IDS = [`${SEED_PREFIX}subscription-`];

let pool: Pool;

async function cleanupSeedRows() {
  const db = drizzle(pool, { schema: apiSchema });
  for (const table of [
    "credit_ledger_entries",
    "subscriptions",
    "bookings",
    "events",
    "partners",
    "user",
  ] as const) {
    await db.execute(
      sql.raw(`DELETE FROM "${table}" WHERE id LIKE '${SEED_PREFIX}%'`),
    );
  }
  await db.execute(
    sql.raw(`DELETE FROM "user_profiles" WHERE user_id LIKE '${SEED_PREFIX}%'`),
  );
  await db.execute(
    sql.raw(
      `DELETE FROM "saved_events" WHERE user_id LIKE '${SEED_PREFIX}%' OR event_id LIKE '${SEED_PREFIX}%'`,
    ),
  );
}

async function countRowsWithPrefix(
  table: string,
  prefixes: string[],
  idColumn = "id",
): Promise<number> {
  const db = drizzle(pool, { schema: apiSchema });
  const conditions = prefixes
    .map((p) => `"${idColumn}" LIKE '${p}%'`)
    .join(" OR ");
  const result = await db.execute(
    sql.raw(`SELECT COUNT(*)::int AS c FROM "${table}" WHERE ${conditions}`),
  );
  const rows = result.rows as Array<{ c: number }>;
  return rows[0]?.c ?? 0;
}

async function countBookingsByStatus(
  status: "CONFIRMED" | "CANCELLED",
): Promise<number> {
  const db = drizzle(pool, { schema: apiSchema });
  const result = await db.execute(
    sql.raw(
      `SELECT COUNT(*)::int AS c FROM "bookings" WHERE id LIKE '${SEED_PREFIX}booking-%' AND status = '${status}'`,
    ),
  );
  const rows = result.rows as Array<{ c: number }>;
  return rows[0]?.c ?? 0;
}

async function getPaginationModule() {
  return import("../../scripts/seed-operations-smoke.ts");
}

beforeAll(async () => {
  pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  await cleanupSeedRows();
});

afterAll(async () => {
  await cleanupSeedRows();
  if (pool) await pool.end();
});

describe("seed-operations-smoke pagination profile", () => {
  it("creates at least 65 events, 45 user profiles, 42 partners, 30 confirmed and 10 cancelled bookings", async () => {
    const mod = await getPaginationModule();
    await cleanupSeedRows();
    const directDb = drizzle(pool, { schema: apiSchema });
    const passwordHash = await Bun.password.hash("Pagination-Smoke-2026!", {
      algorithm: "bcrypt",
      cost: 4,
    });
    await directDb.transaction(async (tx) => {
      await mod.seedPagination(tx as unknown as never, {
        memberCount: mod.paginationMemberCount,
        partnerCount: mod.paginationPartnerCount,
        eventCount: mod.paginationEventCount,
        confirmedBookings: mod.paginationConfirmedBookings,
        cancelledBookings: mod.paginationCancelledBookings,
        daysAhead: 90,
        passwordHash,
      });
    });

    const users = await countRowsWithPrefix("user", SEED_USER_IDS);
    const userProfiles = await countRowsWithPrefix(
      "user_profiles",
      SEED_USER_IDS,
      "user_id",
    );
    const partners = await countRowsWithPrefix("partners", SEED_PARTNER_IDS);
    const events = await countRowsWithPrefix("events", SEED_EVENT_IDS);
    const bookings = await countRowsWithPrefix("bookings", SEED_BOOKING_IDS);
    const subscriptions = await countRowsWithPrefix(
      "subscriptions",
      SEED_SUBSCRIPTION_IDS,
    );
    const confirmedBookings = await countBookingsByStatus("CONFIRMED");
    const cancelledBookings = await countBookingsByStatus("CANCELLED");

    expect(users).toBeGreaterThanOrEqual(45);
    expect(userProfiles).toBe(users);
    expect(partners).toBeGreaterThanOrEqual(42);
    expect(events).toBeGreaterThanOrEqual(65);
    expect(bookings).toBeGreaterThanOrEqual(40);
    expect(confirmedBookings).toBeGreaterThanOrEqual(30);
    expect(cancelledBookings).toBeGreaterThanOrEqual(10);
    expect(subscriptions).toBeGreaterThanOrEqual(4);
  }, 90_000);

  it("is idempotent when reset is followed by seed twice in a row", async () => {
    const mod = await getPaginationModule();
    const directDb = drizzle(pool, { schema: apiSchema });
    const passwordHash = await Bun.password.hash("Pagination-Smoke-2026!", {
      algorithm: "bcrypt",
      cost: 4,
    });

    const runOnce = async () => {
      await cleanupSeedRows();
      await directDb.transaction(async (tx) => {
        await mod.resetTables(tx as unknown as never, null);
        await mod.seedPagination(tx as unknown as never, {
          memberCount: mod.paginationMemberCount,
          partnerCount: mod.paginationPartnerCount,
          eventCount: mod.paginationEventCount,
          confirmedBookings: mod.paginationConfirmedBookings,
          cancelledBookings: mod.paginationCancelledBookings,
          daysAhead: 90,
          passwordHash,
        });
      });
      return {
        users: await countRowsWithPrefix("user", SEED_USER_IDS),
        partners: await countRowsWithPrefix("partners", SEED_PARTNER_IDS),
        events: await countRowsWithPrefix("events", SEED_EVENT_IDS),
        bookings: await countRowsWithPrefix("bookings", SEED_BOOKING_IDS),
      };
    };

    const first = await runOnce();
    const second = await runOnce();
    expect(second).toEqual(first);
  }, 120_000);
});

describe("seed-operations-smoke smoke profile regression", () => {
  it("seedPagination with a 1-user/1-partner/1-event profile writes the minimum expected rows", async () => {
    const mod = await getPaginationModule();
    await cleanupSeedRows();
    const directDb = drizzle(pool, { schema: apiSchema });
    const passwordHash = await Bun.password.hash("Operations-Smoke-2026!", {
      algorithm: "bcrypt",
      cost: 4,
    });
    await directDb.transaction(async (tx) => {
      await mod.seedPagination(tx as unknown as never, {
        memberCount: 5,
        partnerCount: 1,
        eventCount: 1,
        confirmedBookings: 1,
        cancelledBookings: 0,
        daysAhead: 1,
        passwordHash,
      });
    });

    const users = await countRowsWithPrefix("user", SEED_USER_IDS);
    const partners = await countRowsWithPrefix("partners", SEED_PARTNER_IDS);
    const events = await countRowsWithPrefix("events", SEED_EVENT_IDS);
    const bookings = await countRowsWithPrefix("bookings", SEED_BOOKING_IDS);

    expect(users).toBe(5);
    expect(partners).toBe(1);
    expect(events).toBe(1);
    expect(bookings).toBe(1);
  }, 60_000);
});
