import { describe, expect, test } from "bun:test";

import type { Db } from "@/db/client";
import type { Viewer } from "@/lib/auth-profile";

import { invalidationHintsForScopes, toQueryKeys } from "./invalidation";
import { loadAdminData, loadMemberData, loadPartnerData } from "./loaders";
import {
  type BookingRow,
  type EventRow,
  mapBookingView,
  mapCalendarMetadata,
  mapEventView,
  mapPartnerView,
  mapProfileView,
  type PartnerRow,
  type UserProfileRow,
} from "./mappers";
import { dataQueryKeys, normalizeDiscoveryFilters } from "./query-keys";

describe("data access query contracts", () => {
  test("normalizes discovery filters into stable query keys", () => {
    expect(normalizeDiscoveryFilters({ category: " Art " })).toEqual({
      category: "Art",
      partnerId: "all",
      startDate: "any",
      endDate: "any",
    });

    expect(dataQueryKeys.publicDiscovery({ category: "Art" })).toEqual([
      "data-access",
      "public",
      "discovery",
      {
        category: "Art",
        partnerId: "all",
        startDate: "any",
        endDate: "any",
      },
    ]);
  });

  test("saved-only discovery filters produce a distinct member query key", () => {
    expect(normalizeDiscoveryFilters({ savedOnly: "true" })).toEqual({
      category: "all",
      partnerId: "all",
      startDate: "any",
      endDate: "any",
      savedOnly: "true",
    });

    expect(
      dataQueryKeys.memberDiscovery("user-1", { savedOnly: "true" }),
    ).toContainEqual(
      expect.objectContaining({
        savedOnly: "true",
      }),
    );
  });

  test("deduplicates invalidation hints and exposes query keys for actions", () => {
    const keys = toQueryKeys(
      invalidationHintsForScopes([
        { type: "public-discovery" },
        { type: "public-discovery" },
        { type: "member-bookings", userId: "user-1" },
      ]),
    );

    expect(keys).toContainEqual(dataQueryKeys.publicDiscovery());
    expect(keys).toContainEqual(dataQueryKeys.memberBookings("user-1"));
    expect(keys.filter((key) => key[1] === "public")).toHaveLength(1);
  });

  test("exposes precise operational query keys", () => {
    expect(dataQueryKeys.partnerExports("partner-1")).toEqual([
      "data-access",
      "partner",
      "partner-1",
      "exports",
    ]);
    expect(dataQueryKeys.adminMember("user-1")).toEqual([
      "data-access",
      "admin",
      "members",
      "user-1",
    ]);
    expect(dataQueryKeys.bookingEligibility("user-1")).toEqual([
      "data-access",
      "member",
      "user-1",
      "booking-eligibility",
    ]);
  });

  test("targets operational invalidation scopes without broadening ownership", () => {
    const keys = toQueryKeys(
      invalidationHintsForScopes([
        { type: "partner-guests", partnerId: "partner-1" },
        { type: "partner-exports", partnerId: "partner-1" },
        { type: "admin-members", userId: "user-1" },
        { type: "booking-eligibility", userId: "user-1" },
      ]),
    );

    expect(keys).toContainEqual(dataQueryKeys.partnerPortal("partner-1"));
    expect(keys).toContainEqual(dataQueryKeys.partnerGuests("partner-1"));
    expect(keys).toContainEqual(dataQueryKeys.partnerExports("partner-1"));
    expect(keys).toContainEqual(dataQueryKeys.adminMembers());
    expect(keys).toContainEqual(dataQueryKeys.adminMember("user-1"));
    expect(keys).toContainEqual(dataQueryKeys.bookingEligibility("user-1"));
    expect(keys).not.toContainEqual(dataQueryKeys.partnerPortal("partner-2"));
  });
});

describe("data access mappers", () => {
  test("maps event rows to display-safe event view models", () => {
    const partner = partnerRow();
    const view = mapEventView({
      event: eventRow({ remainingCapacity: 0, ticketType: "VOUCHER" }),
      partner,
      saved: true,
    });

    expect(view.partnerName).toBe(partner.name);
    expect(view.saved).toBe(true);
    expect(view.ticketType).toBe("Waitlist");
    expect(view.ctaLabel).toBe("Join waitlist");
    expect(view.capacityLabel).toBe("Waitlist");
    expect(view.calendarMetadata).toMatchObject({
      eventId: "event-1",
      title: "Neon Gallery",
      description: "After hours",
      partnerName: partner.name,
      address: "Auguststrasse 24",
      startDateTime: "2026-06-01T18:00:00.000Z",
    });
  });

  test("maps booking rows with raw calendar metadata", () => {
    const partner = partnerRow();
    const view = mapBookingView({
      booking: bookingRow(),
      event: eventRow(),
      partner,
    });

    expect(view.dateLabel).toContain("Jun");
    expect(view.calendarMetadata).toMatchObject({
      eventId: "event-1",
      title: "Neon Gallery",
      partnerName: partner.name,
      startDateTime: "2026-06-01T18:00:00.000Z",
    });
  });

  test("omits calendar metadata for unusable event dates", () => {
    expect(
      mapCalendarMetadata({
        event: eventRow({ dateTime: new Date("invalid") }),
        partnerName: "Kunsthalle Mitte",
      }),
    ).toBeUndefined();

    expect(
      mapEventView({
        event: eventRow({ address: " " }),
        partner: partnerRow(),
      }).calendarMetadata,
    ).toBeUndefined();
  });

  test("maps partner and profile rows without persistence-only fields", () => {
    expect(mapPartnerView(partnerRow()).logoInitial).toBe("K");
    expect(
      mapProfileView({
        profile: profileRow(),
        user: { email: "member@example.com", name: "Fallback Name" },
      }),
    ).toMatchObject({
      fullName: "Ada Lovelace",
      email: "member@example.com",
      credits: 12,
      language: "EN",
    });
  });
});

describe("authorized data loaders", () => {
  test("rejects member reads before database access for guests", async () => {
    const error = await captureError(() =>
      loadMemberData(guestViewer(), {}, throwingDb()),
    );
    expect(error).toMatchObject({ code: "unauthenticated", status: 401 });
  });

  test("rejects partner reads for another partner before database access", async () => {
    const error = await captureError(() =>
      loadPartnerData(partnerViewer("partner-1"), "partner-2", throwingDb()),
    );
    expect(error).toMatchObject({ code: "forbidden", status: 403 });
  });

  test("rejects admin reads for non-admin viewers before database access", async () => {
    const error = await captureError(() =>
      loadAdminData(partnerViewer("partner-1"), throwingDb()),
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

function throwingDb() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error("database should not be read");
      },
    },
  ) as Db;
}

function guestViewer(): Viewer {
  return {
    kind: "guest",
    viewerContext: "guest",
    language: "EN",
  };
}

function partnerViewer(partnerId: string): Viewer {
  return {
    kind: "authenticated",
    viewerContext: "partner",
    user: {
      id: "partner-user",
      email: "partner@example.com",
      name: "Partner User",
      emailVerified: true,
    },
    role: "PARTNER",
    partnerId,
    language: "EN",
    credits: 0,
    subscriptionStatus: "ACTIVE",
    subscriptionPlan: "PARTNER",
    onboardingComplete: true,
    savedCount: 0,
    firstName: "Partner",
    lastName: "User",
    showProfile: false,
    showLogout: true,
  };
}

function partnerRow(overrides: Partial<PartnerRow> = {}): PartnerRow {
  return {
    id: "partner-1",
    name: "Kunsthalle Mitte",
    address: "Auguststrasse 24",
    contactEmail: "partner@example.com",
    logoUrl: null,
    venueCheckInToken: "token",
    portalUserId: null,
    portalUserEmail: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function eventRow(overrides: Partial<EventRow> = {}): EventRow {
  return {
    id: "event-1",
    partnerId: "partner-1",
    title: "Neon Gallery",
    description: "After hours",
    category: "Art",
    eventType: "Gallery",
    dateTime: new Date("2026-06-01T18:00:00Z"),
    timingMode: "TIME_SLOT",
    startTimeMinutes: 1080,
    weekday: 1,
    address: "Auguststrasse 24",
    neighborhood: "Mitte",
    lat: null,
    lng: null,
    imageUrl: "https://example.com/image.jpg",
    tags: [],
    creditPrice: 2,
    totalCapacity: 20,
    remainingCapacity: 10,
    ticketType: "SECRET_CODE",
    voucherTemplate: null,
    secretCodeRules: null,
    secretCode: null,
    secretCodeMode: "MANUAL",
    promoCode: null,
    eventWebsiteUrl: null,
    barrierFree: false,
    languages: ["EN"],
    targetAgeGroups: [],
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function bookingRow(overrides: Partial<BookingRow> = {}): BookingRow {
  return {
    id: "booking-1",
    userId: "user-1",
    eventId: "event-1",
    partnerId: "partner-1",
    ticketsCount: 2,
    totalCredits: 4,
    status: "CONFIRMED",
    redemptionType: "SECRET_CODE",
    redemptionInfo: "UNVEILED",
    redemptionUrl: null,
    idempotencyKey: "booking-key",
    adminActorId: null,
    checkedInAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function profileRow(overrides: Partial<UserProfileRow> = {}): UserProfileRow {
  return {
    userId: "user-1",
    role: "USER",
    partnerId: null,
    credits: 12,
    firstName: "Ada",
    lastName: "Lovelace",
    language: "EN",
    onboardingComplete: true,
    subscriptionStatus: "ACTIVE",
    subscriptionPlan: "BASIC_BERLIN",
    subscriptionPeriodEnd: new Date("2026-07-01T00:00:00Z"),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    paymentMethod: null,
    billingAddress: null,
    newsletterOptIn: false,
    newsletterStatus: "NONE",
    newsletterConfirmedAt: null,
    newsletterToken: null,
    newsletterTokenExpiresAt: null,
    ageGroup: null,
    interests: [],
    moods: [],
    districts: [],
    maxDistance: 0,
    timing: [],
    preferredDays: [],
    preferredLanguages: [],
    accessibility: false,
    preferencesUpdatedAt: null,
    sessionCount: 0,
    eventOpenCount: 0,
    bookingCount: 0,
    waitlistCount: 0,
    savedCount: 0,
    unsavedCount: 0,
    filterApplyCount: 0,
    viewCounts: {},
    recentEventIds: [],
    lastSeenAt: null,
    lastView: null,
    lastOpenedEventId: null,
    lastBookedEventId: null,
    lastWaitlistedEventId: null,
    lastSavedEventId: null,
    onboardingCompletedAt: null,
    lastFilter: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}
