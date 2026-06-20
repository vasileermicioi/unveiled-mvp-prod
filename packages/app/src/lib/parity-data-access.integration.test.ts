import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { postgresClient } from "~/db/client";
import {
  loadAdminData,
  loadCurrentPartnerData,
  loadMemberData,
  loadPartnerData,
  loadPublicDiscoveryData,
} from "~/lib/data-access/loaders";
import {
  assertNoDemoFixtureLabels,
  createParityViewer,
  type ParitySeedSummary,
  parityFixtureEmails,
  parityFixtureIds,
} from "~/lib/testing/parity-fixtures";
import {
  createParityDb,
  resetParityWorld,
  seedParityWorld,
} from "~/lib/testing/parity-seed";

const parityEnabled = Boolean(process.env.PARITY_TEST_DATABASE_URL);
const parityTest = parityEnabled ? test : test.skip;
const database = parityEnabled ? createParityDb() : null;
let seedSummary: ParitySeedSummary | null = null;

function getDatabase() {
  if (!database) {
    throw new Error("Parity test database is not configured.");
  }
  return database;
}

describe("parity data-access regression", () => {
  beforeAll(async () => {
    if (!database) return;
    await resetParityWorld(database);
    seedSummary = await seedParityWorld(database);
  }, 30_000);

  afterAll(async () => {
    if (!database) return;
    await resetParityWorld(database);
    await postgresClient.end();
  }, 30_000);

  parityTest(
    "loads seeded public, member, partner, and admin surfaces without demo labels",
    async () => {
      const testDb = getDatabase();
      const publicData = await loadPublicDiscoveryData({}, testDb);
      const memberData = await loadMemberData(
        createParityViewer({
          userId: seedSummary?.users.activeMember.id ?? "",
          email: parityFixtureEmails.activeMember,
          role: "USER",
        }),
        {},
        testDb,
      );
      const partnerData = await loadCurrentPartnerData(
        createParityViewer({
          userId: seedSummary?.users.partner.id ?? "",
          email: parityFixtureEmails.partner,
          role: "PARTNER",
          partnerId: parityFixtureIds.partner,
        }),
        testDb,
      );
      const adminData = await loadAdminData(
        createParityViewer({
          userId: seedSummary?.users.admin.id ?? "",
          email: parityFixtureEmails.admin,
          role: "ADMIN",
        }),
        undefined,
        testDb,
      );

      expect(publicData.featuredEvents.map((event) => event.title)).toContain(
        "Parity Public Opening",
      );
      expect(
        publicData.featuredEvents.find(
          (event) => event.id === parityFixtureIds.events.public,
        ),
      ).toMatchObject({
        partnerName: "Parity Partner Venue",
        capacityLabel: "9 available",
        ctaLabel: "Book now",
      });

      expect(
        memberData.discovery.featuredEvents.filter(
          (event) => !event.id.startsWith("booking-tx-"),
        ),
      ).toHaveLength(5);
      expect(memberData.savedEvents.map((event) => event.title)).toContain(
        "Parity Voucher Night",
      );
      expect(
        memberData.bookings.map((booking) => booking.redemptionCode),
      ).toContain("PARITY-CHECKIN");

      expect(partnerData.guests.map((guest) => guest.bookingId)).toContain(
        parityFixtureIds.bookings.confirmed,
      );
      expect(partnerData.partner?.venueQrTokenLabel).toContain("Token");

      expect(adminData.events.items.map((event) => event.title)).toContain(
        "Parity Secret Access",
      );
      expect(adminData.members.items.map((member) => member.email)).toContain(
        parityFixtureEmails.frozenMember,
      );

      assertNoDemoFixtureLabels(
        JSON.stringify({
          publicData,
          memberData,
          partnerData,
          adminData,
        }),
      );
    },
  );

  parityTest("keeps protected loaders role-scoped", async () => {
    const testDb = getDatabase();
    const error = await captureError(() =>
      loadPartnerData(
        createParityViewer({
          userId: seedSummary?.users.partner.id ?? "",
          email: parityFixtureEmails.partner,
          role: "PARTNER",
          partnerId: parityFixtureIds.partner,
        }),
        "partner-outside-scope",
        testDb,
      ),
    );

    expect(error).toMatchObject({ code: "forbidden", status: 403 });
  });
});

async function captureError(operation: () => Promise<unknown>) {
  try {
    await operation();
  } catch (error) {
    return error;
  }
  throw new Error("Expected operation to reject");
}
