import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

let rawDatabaseUrl =
  process.env.BOOKING_TRANSACTION_TEST_DATABASE_URL ||
  process.env.PARITY_TEST_DATABASE_URL;

// Automatically resolve pooled Neon URL to direct unpooled URL to avoid transaction hangs
if (rawDatabaseUrl?.includes("-pooler")) {
  try {
    const parsed = new URL(rawDatabaseUrl);
    if (
      parsed.hostname.endsWith(".neon.tech") &&
      parsed.hostname.includes("-pooler")
    ) {
      parsed.hostname = parsed.hostname.replace("-pooler", "");
      rawDatabaseUrl = parsed.toString();
    }
  } catch {
    rawDatabaseUrl = rawDatabaseUrl.replace("-pooler", "");
  }
}

const databaseUrl = rawDatabaseUrl;
const integrationTest = databaseUrl ? test : test.skip;

describe("behavior tracking integration", () => {
  integrationTest(
    "tracks event open, limits recent events array to 5 and shifts duplicates",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { trackEventOpenInDb } = await import("@/lib/behavior-tracking");

      const ids = idsFor("event-open");
      try {
        await seedMember(ids.userId);

        // 1. Initial event open
        await trackEventOpenInDb(ids.userId, "event-1", "discovery");

        let profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile).toBeDefined();
        expect(profile?.eventOpenCount).toBe(1);
        expect(profile?.lastOpenedEventId).toBe("event-1");
        expect(profile?.lastView).toBe("discovery");
        expect(profile?.viewCounts).toEqual({ "event-1": 1 });
        expect(profile?.recentEventIds).toEqual(["event-1"]);
        expect(profile?.lastSeenAt).toBeDefined();

        // 2. Open same event again
        await trackEventOpenInDb(ids.userId, "event-1", "detail");

        profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile?.eventOpenCount).toBe(2);
        expect(profile?.viewCounts).toEqual({ "event-1": 2 });
        expect(profile?.recentEventIds).toEqual(["event-1"]);

        // 3. Open multiple different events to check array capping at 5
        await trackEventOpenInDb(ids.userId, "event-2", "discovery");
        await trackEventOpenInDb(ids.userId, "event-3", "discovery");
        await trackEventOpenInDb(ids.userId, "event-4", "discovery");
        await trackEventOpenInDb(ids.userId, "event-5", "discovery");
        await trackEventOpenInDb(ids.userId, "event-6", "discovery");

        profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile?.eventOpenCount).toBe(7);
        // "event-6" should be first (most recent), up to 5 elements. "event-1" should be dropped.
        expect(profile?.recentEventIds).toEqual([
          "event-6",
          "event-5",
          "event-4",
          "event-3",
          "event-2",
        ]);

        // 4. Open "event-3" again (was in middle of list)
        await trackEventOpenInDb(ids.userId, "event-3", "discovery");

        profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        // "event-3" should be promoted to the front without duplicates
        expect(profile?.recentEventIds).toEqual([
          "event-3",
          "event-6",
          "event-5",
          "event-4",
          "event-2",
        ]);
      } finally {
        await cleanup(ids.userId);
      }
    },
    30_000,
  );

  integrationTest(
    "tracks filter apply and saves last filter information",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { trackFilterApplyInDb } = await import("@/lib/behavior-tracking");

      const ids = idsFor("filter-apply");
      try {
        await seedMember(ids.userId);

        const filterPayload = {
          category: "music",
          partnerId: "partner-abc",
          startDate: "2026-05-21T00:00:00Z",
          resultCount: 12,
        };

        await trackFilterApplyInDb(ids.userId, filterPayload, "explore");

        const profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile?.filterApplyCount).toBe(1);
        expect(profile?.lastView).toBe("explore");
        expect(profile?.lastFilter?.category).toBe("music");
        expect(profile?.lastFilter?.partnerId).toBe("partner-abc");
        expect(profile?.lastFilter?.resultCount).toBe(12);
        expect(profile?.lastFilter?.appliedAt).toBeDefined();
      } finally {
        await cleanup(ids.userId);
      }
    },
    30_000,
  );

  integrationTest(
    "tracks session with 15-minute throttle",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { userProfiles } = await import("@/db/schema");
      const { trackSessionInDb } = await import("@/lib/behavior-tracking");

      const ids = idsFor("session");
      try {
        await seedMember(ids.userId);

        // 1. Initial tracking: should increment sessionCount
        await trackSessionInDb(ids.userId);

        let profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile?.sessionCount).toBe(1);
        const firstSeenAt = profile?.lastSeenAt;
        expect(firstSeenAt).toBeDefined();

        // 2. Immediate subsequent tracking: should be throttled (no count increment)
        await trackSessionInDb(ids.userId);

        profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile?.sessionCount).toBe(1);

        // 3. Manually set lastSeenAt to 20 minutes ago
        const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
        await db
          .update(userProfiles)
          .set({ lastSeenAt: twentyMinutesAgo })
          .where(eq(userProfiles.userId, ids.userId));

        // 4. Track session again: should increment sessionCount to 2
        await trackSessionInDb(ids.userId);

        profile = await db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        });
        expect(profile?.sessionCount).toBe(2);
        expect(profile?.lastSeenAt?.getTime()).toBeGreaterThan(
          twentyMinutesAgo.getTime(),
        );
      } finally {
        await cleanup(ids.userId);
      }
    },
    30_000,
  );

  integrationTest(
    "executes as safe no-op for guest or non-existent users",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { trackEventOpenInDb, trackFilterApplyInDb, trackSessionInDb } =
        await import("@/lib/behavior-tracking");

      const nonExistentUserId = `guest-${crypto.randomUUID()}`;

      // All of these should resolve successfully without throwing
      await trackEventOpenInDb(nonExistentUserId, "event-1", "discovery");
      await trackFilterApplyInDb(
        nonExistentUserId,
        { category: "music" },
        "discovery",
      );
      await trackSessionInDb(nonExistentUserId);
    },
    30_000,
  );
});

function idsFor(label: string) {
  const prefix = `behavior-${label}-${crypto.randomUUID()}`;
  return {
    userId: `${prefix}-user`,
  };
}

async function seedMember(userId: string) {
  const { db } = await import("@/db/client");
  const { user, userProfiles } = await import("@/db/schema");

  await db.insert(user).values({
    id: userId,
    name: "Behavior Test User",
    email: `${userId}@example.test`,
  });

  await db.insert(userProfiles).values({
    userId,
    subscriptionStatus: "ACTIVE",
  });
}

async function cleanup(userId: string) {
  const { db } = await import("@/db/client");
  const { user } = await import("@/db/schema");

  try {
    await db.delete(user).where(eq(user.id, userId));
  } catch (err) {
    console.error("Cleanup failed for user", userId, err);
  }
}
