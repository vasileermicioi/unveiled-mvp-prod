import { afterAll, beforeEach, describe, expect, test } from "bun:test";

import {
  loadAdminData,
  loadCurrentPartnerData,
  loadMemberData,
  loadPartnerData,
  loadPublicDiscoveryData,
} from "@/lib/data-access/loaders";
import {
  assertNoDemoFixtureLabels,
  createParityViewer,
  parityFixtureEmails,
  parityFixtureIds,
} from "@/lib/testing/parity-fixtures";
import {
  createParityDb,
  resetParityWorld,
  seedParityWorld,
} from "@/lib/testing/parity-seed";

const parityEnabled = Boolean(process.env.PARITY_TEST_DATABASE_URL);
const parityTest = parityEnabled ? test : test.skip;
const database = parityEnabled ? createParityDb() : null;

function getDatabase() {
  if (!database) {
    throw new Error("Parity test database is not configured.");
  }
  return database;
}

describe("parity data-access regression", () => {
  beforeEach(async () => {
    if (!database) return;
    await resetParityWorld(database);
    await seedParityWorld(database);
  });

  afterAll(async () => {
    if (!database) return;
    await resetParityWorld(database);
  });

  parityTest(
    "loads seeded public, member, partner, and admin surfaces without demo labels",
    async () => {
      const testDb = getDatabase();
      const publicData = await loadPublicDiscoveryData({}, testDb);
      const memberData = await loadMemberData(
        createParityViewer({
          userId: parityFixtureIds.users.activeMember,
          email: parityFixtureEmails.activeMember,
          role: "USER",
        }),
        {},
        testDb,
      );
      const partnerData = await loadCurrentPartnerData(
        createParityViewer({
          userId: parityFixtureIds.users.partner,
          email: parityFixtureEmails.partner,
          role: "PARTNER",
          partnerId: parityFixtureIds.partner,
        }),
        testDb,
      );
      const adminData = await loadAdminData(
        createParityViewer({
          userId: parityFixtureIds.users.admin,
          email: parityFixtureEmails.admin,
          role: "ADMIN",
        }),
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

      expect(memberData.discovery.featuredEvents).toHaveLength(5);
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

      expect(adminData.events.map((event) => event.title)).toContain(
        "Parity Secret Access",
      );
      expect(adminData.members.map((member) => member.email)).toContain(
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
          userId: parityFixtureIds.users.partner,
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
