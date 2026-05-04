import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

const databaseUrl = process.env.BOOKING_TRANSACTION_TEST_DATABASE_URL;
const integrationTest = databaseUrl ? test : test.skip;

describe("booking transactions integration", () => {
  integrationTest(
    "books atomically and returns idempotent retries",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { events, partners, user, userProfiles } = await import(
        "@/db/schema"
      );
      const { bookMemberEvent } = await import("@/lib/booking-transactions");

      const ids = idsFor("success");
      await seedMemberEvent(ids, { credits: 10, remainingCapacity: 2 });

      const result = await bookMemberEvent({
        userId: ids.userId,
        eventId: ids.eventId,
        ticketQuantity: 2,
        idempotencyKey: "retry-success",
      });
      expect(result.state).toBe("confirmed");

      const retry = await bookMemberEvent({
        userId: ids.userId,
        eventId: ids.eventId,
        ticketQuantity: 2,
        idempotencyKey: "retry-success",
      });
      expect(retry).toEqual(result);

      const [profile, event] = await Promise.all([
        db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        }),
        db.query.events.findFirst({
          where: (table, { eq }) => eq(table.id, ids.eventId),
        }),
      ]);
      expect(profile?.credits).toBe(6);
      expect(event?.remainingCapacity).toBe(0);

      await cleanup(ids);

      async function seedMemberEvent(
        input: ReturnType<typeof idsFor>,
        options: { credits: number; remainingCapacity: number },
      ) {
        await db.insert(user).values({
          id: input.userId,
          name: "Test Member",
          email: `${input.userId}@example.test`,
        });
        await db.insert(partners).values({
          id: input.partnerId,
          name: "Partner",
          address: "Address",
          contactEmail: `${input.partnerId}@example.test`,
        });
        await db.insert(userProfiles).values({
          userId: input.userId,
          credits: options.credits,
          subscriptionStatus: "ACTIVE",
        });
        await db
          .insert(events)
          .values(eventValues(input, options.remainingCapacity));
      }
    },
  );

  integrationTest(
    "rejects invalid booking states without partial mutation",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { bookMemberEvent } = await import("@/lib/booking-transactions");

      const inactive = idsFor("inactive");
      await seedFixture(inactive, {
        credits: 10,
        remainingCapacity: 3,
        subscriptionStatus: "INACTIVE",
      });

      expect(
        (
          await bookMemberEvent({
            userId: inactive.userId,
            eventId: inactive.eventId,
            ticketQuantity: 1,
            idempotencyKey: "inactive",
          })
        ).state,
      ).toBe("inactive_subscription");

      const insufficient = idsFor("credits");
      await seedFixture(insufficient, {
        credits: 1,
        remainingCapacity: 3,
        subscriptionStatus: "ACTIVE",
      });

      expect(
        (
          await bookMemberEvent({
            userId: insufficient.userId,
            eventId: insufficient.eventId,
            ticketQuantity: 2,
            idempotencyKey: "credits",
          })
        ).state,
      ).toBe("insufficient_credits");

      const profile = await db.query.userProfiles.findFirst({
        where: (table, { eq }) => eq(table.userId, insufficient.userId),
      });
      expect(profile?.credits).toBe(1);

      await cleanup(inactive);
      await cleanup(insufficient);
    },
  );

  integrationTest(
    "prevents oversell under concurrent final-capacity booking",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { bookMemberEvent } = await import("@/lib/booking-transactions");

      const first = idsFor("race-a");
      const second = idsFor("race-b");
      await seedFixture(first, {
        credits: 10,
        remainingCapacity: 1,
        subscriptionStatus: "ACTIVE",
      });
      await seedUserProfile(second.userId, { credits: 10 });

      const results = await Promise.all([
        bookMemberEvent({
          userId: first.userId,
          eventId: first.eventId,
          ticketQuantity: 1,
          idempotencyKey: "race-a",
        }),
        bookMemberEvent({
          userId: second.userId,
          eventId: first.eventId,
          ticketQuantity: 1,
          idempotencyKey: "race-b",
        }),
      ]);

      expect(
        results.filter((result) => result.state === "confirmed"),
      ).toHaveLength(1);
      expect(
        results.filter((result) => result.state === "sold_out"),
      ).toHaveLength(1);

      const event = await db.query.events.findFirst({
        where: (table, { eq }) => eq(table.id, first.eventId),
      });
      expect(event?.remainingCapacity).toBe(0);

      await cleanup(first);
      await cleanup({
        ...second,
        eventId: first.eventId,
        partnerId: first.partnerId,
      });
    },
  );

  integrationTest(
    "creates waitlist without credit or capacity changes",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { joinEventWaitlist } = await import("@/lib/booking-transactions");

      const ids = idsFor("waitlist");
      await seedFixture(ids, {
        credits: 5,
        remainingCapacity: 0,
        subscriptionStatus: "ACTIVE",
      });

      const result = await joinEventWaitlist({
        userId: ids.userId,
        eventId: ids.eventId,
        ticketQuantity: 1,
      });
      expect(result.state).toBe("waitlist");

      const [profile, event] = await Promise.all([
        db.query.userProfiles.findFirst({
          where: (table, { eq }) => eq(table.userId, ids.userId),
        }),
        db.query.events.findFirst({
          where: (table, { eq }) => eq(table.id, ids.eventId),
        }),
      ]);
      expect(profile?.credits).toBe(5);
      expect(event?.remainingCapacity).toBe(0);

      await cleanup(ids);
    },
  );

  integrationTest(
    "creates admin tickets and credit adjustment ledger entries",
    async () => {
      process.env.DATABASE_URL = databaseUrl;
      const { db } = await import("@/db/client");
      const { creditLedgerEntries } = await import("@/db/schema");
      const { adjustUserCredits, createAdminTicket } = await import(
        "@/lib/booking-transactions"
      );

      const ids = idsFor("admin");
      const adminId = `${ids.userId}-admin`;
      await seedFixture(ids, {
        credits: 5,
        remainingCapacity: 2,
        subscriptionStatus: "ACTIVE",
      });
      await seedUserProfile(adminId, { credits: 0, role: "ADMIN" });

      const ticket = await createAdminTicket({
        adminUserId: adminId,
        userId: ids.userId,
        eventId: ids.eventId,
        ticketQuantity: 1,
        consumeCapacity: true,
        debitCredits: false,
      });
      expect(ticket.state).toBe("confirmed");

      const adjustment = await adjustUserCredits({
        adminUserId: adminId,
        userId: ids.userId,
        amount: 2,
        reason: "Integration test adjustment",
      });
      expect(adjustment.state).toBe("adjusted");

      const ledger = await db.query.creditLedgerEntries.findFirst({
        where: (table, { eq }) => eq(table.actorUserId, adminId),
      });
      expect(ledger?.type).toBe("ADMIN_ADJUST");

      await db
        .delete(creditLedgerEntries)
        .where(eq(creditLedgerEntries.actorUserId, adminId));
      await cleanup(ids);
      await cleanupUser(adminId);
    },
  );
});

function idsFor(label: string) {
  const prefix = `booking-tx-${label}-${crypto.randomUUID()}`;
  return {
    userId: `${prefix}-user`,
    partnerId: `${prefix}-partner`,
    eventId: `${prefix}-event`,
  };
}

function eventValues(
  ids: ReturnType<typeof idsFor>,
  remainingCapacity: number,
) {
  return {
    id: ids.eventId,
    partnerId: ids.partnerId,
    title: "Transactional Event",
    description: "Integration test event",
    category: "Test",
    eventType: "Test",
    dateTime: new Date(Date.now() + 86_400_000),
    address: "Test address",
    neighborhood: "Mitte",
    creditPrice: 2,
    totalCapacity: Math.max(remainingCapacity, 1),
    remainingCapacity,
    ticketType: "SECRET_CODE" as const,
    secretCodeMode: "MANUAL" as const,
    secretCode: "UNVEILED",
  };
}

async function seedFixture(
  ids: ReturnType<typeof idsFor>,
  options: {
    credits: number;
    remainingCapacity: number;
    subscriptionStatus: "ACTIVE" | "INACTIVE";
  },
) {
  const { db } = await import("@/db/client");
  const { events, partners } = await import("@/db/schema");
  await seedUserProfile(ids.userId, {
    credits: options.credits,
    subscriptionStatus: options.subscriptionStatus,
  });
  await db.insert(partners).values({
    id: ids.partnerId,
    name: "Partner",
    address: "Address",
    contactEmail: `${ids.partnerId}@example.test`,
  });
  await db.insert(events).values(eventValues(ids, options.remainingCapacity));
}

async function seedUserProfile(
  userId: string,
  options: {
    credits: number;
    role?: "USER" | "ADMIN";
    subscriptionStatus?: "ACTIVE" | "INACTIVE";
  },
) {
  const { db } = await import("@/db/client");
  const { user, userProfiles } = await import("@/db/schema");
  await db.insert(user).values({
    id: userId,
    name: "Test User",
    email: `${userId}@example.test`,
  });
  await db.insert(userProfiles).values({
    userId,
    role: options.role ?? "USER",
    credits: options.credits,
    subscriptionStatus: options.subscriptionStatus ?? "ACTIVE",
  });
}

async function cleanup(ids: ReturnType<typeof idsFor>) {
  const { db } = await import("@/db/client");
  const {
    bookingIdempotencyRecords,
    bookings,
    creditLedgerEntries,
    events,
    partners,
    waitlistEntries,
  } = await import("@/db/schema");

  await db
    .delete(bookingIdempotencyRecords)
    .where(eq(bookingIdempotencyRecords.userId, ids.userId));
  await db
    .delete(creditLedgerEntries)
    .where(eq(creditLedgerEntries.userId, ids.userId));
  await db
    .delete(waitlistEntries)
    .where(eq(waitlistEntries.userId, ids.userId));
  await db.delete(bookings).where(eq(bookings.userId, ids.userId));
  await db.delete(events).where(eq(events.id, ids.eventId));
  await db.delete(partners).where(eq(partners.id, ids.partnerId));
  await cleanupUser(ids.userId);
}

async function cleanupUser(userId: string) {
  const { db } = await import("@/db/client");
  const { user } = await import("@/db/schema");
  await db.delete(user).where(eq(user.id, userId));
}
