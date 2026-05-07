import { describe, expect, test } from "bun:test";

import type { Viewer } from "@/lib/auth-profile";
import { createLiveDataView } from "./live-view-adapters";
import type {
  AdminData,
  MemberData,
  PartnerData,
  PublicDiscoveryData,
} from "./repositories";
import {
  createMemberInitialSurfaceData,
  createPartnerInitialSurfaceData,
  createPublicInitialSurfaceData,
  isInitialSurfaceData,
} from "./surface-data";

describe("initial surface data", () => {
  test("wraps public loader data with surface identity", () => {
    const surface = createPublicInitialSurfaceData(publicData(), {
      category: "Art",
    });

    expect(surface.surface).toBe("public");
    expect(surface.filters?.category).toBe("Art");
    expect(isInitialSurfaceData(surface)).toBe(true);
  });

  test("wraps authenticated member data with viewer scope", () => {
    const viewer = authenticatedViewer({ userId: "user-1" });
    const surface = createMemberInitialSurfaceData(viewer, memberData());

    expect(surface.surface).toBe("member");
    expect(surface.userId).toBe("user-1");
  });

  test("wraps partner data with partner scope", () => {
    const viewer = authenticatedViewer({
      userId: "partner-user",
      partnerId: "partner-1",
    });
    const surface = createPartnerInitialSurfaceData(viewer, partnerData());

    expect(surface.surface).toBe("partner");
    expect(surface.partnerId).toBe("partner-1");
  });

  test("maps authorized surface payloads to live UI values", () => {
    const live = createLiveDataView({
      publicData: publicData(),
      memberData: memberData(),
      partnerData: partnerData(),
      adminData: adminData(),
      isLoading: false,
      isError: false,
      refetchActiveSurface: () => undefined,
    });

    expect(live.events).toHaveLength(1);
    expect(live.events[0]?.bookingAvailabilityState).toBe("frozen");
    expect(live.activeRangeLabel).toBe("Upcoming");
    expect(live.activeFilterCount).toBe(1);
    expect(live.publicStats[0]?.value).toBe("1");
    expect(live.profile.email).toBe("member@example.com");
    expect(live.bookings[0]?.eventTitle).toBe("Live Booking");
    expect(live.creditLedgerEntries[0]?.reasonLabel).toBe("Booking");
    expect(live.partner?.name).toBe("Venue");
    expect(live.partnerGuests[0]?.name).toBe("Guest One");
    expect(live.partnerGuests[0]?.eventId).toBe("event-1");
    expect(live.partnerGuests[0]?.checkInDisabled).toBe(false);
    expect(live.partnerGuestTotal).toBe("2 guests");
    expect(live.adminEvents[0]?.title).toBe("Admin Event");
    expect(live.adminEvents[0]?.codeStrategyLabel).toBe("Secret code");
    expect(live.adminDashboardMetrics[0]?.value).toBe("4");
    expect(live.adminDashboardMetrics[1]?.value).toBe("8");
    expect(live.adminMembers[0]?.billingOverrideActions).toContain("freeze");
  });
});

function publicData(): PublicDiscoveryData {
  return {
    featuredEvents: [
      {
        id: "event-1",
        title: "Live Event",
        partnerName: "Venue",
        partnerId: "partner-1",
        category: "Art",
        dateLabel: "Tomorrow",
        neighborhood: "Mitte",
        address: "Berlin",
        imageUrl: "https://example.com/event.jpg",
        creditPrice: 2,
        remainingCapacity: 10,
        capacityLabel: "10 available",
        ticketType: "Secret code",
        description: "Live database event",
        saved: true,
        ctaLabel: "Book now",
        mapLabel: "Mitte Art",
        bookingAvailabilityState: "frozen",
      },
    ],
    activePartners: [
      {
        id: "partner-1",
        name: "Venue",
        address: "Berlin",
        logoInitial: "V",
        venueQrTokenStatus: "active",
        venueQrTokenLabel: "Token active",
      },
    ],
    categories: ["Art"],
    partnerOptions: [{ id: "partner-1", name: "Venue" }],
    stats: {
      upcomingEventCount: 1,
      activePartnerCount: 1,
      membershipCategoryLabels: ["Art"],
    },
  };
}

function memberData(): MemberData {
  return {
    discovery: {
      ...publicData(),
      savedEventIds: [],
      activeRangeLabel: "Upcoming",
      resultCount: 1,
      activeFilterCount: 1,
    },
    savedEvents: [],
    bookings: [
      {
        id: "booking-1",
        eventId: "event-1",
        partnerId: "partner-1",
        eventTitle: "Live Booking",
        dateLabel: "Tomorrow",
        partnerName: "Venue",
        eventAddress: "Berlin",
        ticketCount: 2,
        totalCredits: 4,
        statusLabel: "Confirmed",
        redemptionType: "SECRET_CODE",
        redemptionCode: "LIVE",
        checkedInLabel: "Not checked in",
        copied: false,
      },
    ],
    profile: {
      userId: "user-1",
      fullName: "Member One",
      email: "member@example.com",
      firstName: "Member",
      lastName: "One",
      credits: 0,
      currentPlanLabel: "Basic Berlin",
      statusBadgeLabel: "Active",
      nextBillDate: "Not scheduled",
      billingAddress: "Not set",
      paymentMethod: "Not set",
      language: "DE",
      onboardingComplete: false,
      subscriptionStatus: "INACTIVE",
      profileComplete: true,
      newsletterOptIn: false,
    },
    wallet: {
      credits: 8,
      ledger: [
        {
          id: "ledger-1",
          amount: -4,
          direction: "debit",
          reasonLabel: "Booking",
          createdLabel: "Today",
          resultingBalance: 8,
        },
      ],
    },
    preferences: {
      ageGroup: null,
      interests: ["Art"],
      moods: ["Leicht"],
      districts: [],
      maxDistance: 10,
      timing: [],
      preferredDays: [],
      preferredLanguages: [],
      accessibility: false,
    },
  };
}

function partnerData(): PartnerData {
  return {
    partner: {
      id: "partner-1",
      name: "Venue",
      address: "Berlin",
      logoInitial: "V",
      venueQrTokenStatus: "active",
      venueQrTokenLabel: "Token active",
    },
    eventOptions: [{ id: "event-1", title: "Live Event", dateLabel: "Soon" }],
    guests: [
      {
        bookingId: "booking-1",
        eventId: "event-1",
        partnerId: "partner-1",
        userId: "user-1",
        userShortId: "user-1",
        guestName: "Guest One",
        guestEmail: "guest@example.com",
        eventTitle: "Live Event",
        redemptionCode: "LIVE",
        statusLabel: "Confirmed",
        tickets: 2,
        createdAt: "Today",
        checkedInLabel: "Not checked in",
        checkInAvailableLabel: "Check-in available",
      },
    ],
    guestCount: 1,
    ticketCount: 2,
    exportAvailable: true,
    exportRows: [
      {
        bookingId: "booking-1",
        userId: "user-1",
        event: "Live Event",
        code: "LIVE",
        status: "CONFIRMED",
        tickets: 2,
        createdAt: new Date("2026-05-04T18:00:00.000Z"),
      },
    ],
  };
}

function adminData(): AdminData {
  return {
    dashboard: {
      upcomingEventCount: 1,
      activePartnerCount: 1,
      memberCount: 2,
      confirmedBookingCount: 4,
      totalBookings: 4,
      creditsBurned: 8,
      totalGuests: 5,
      recentBookings: [],
      exportPartnerOptions: [{ id: "partner-1", name: "Venue" }],
      exportAvailable: false,
    },
    events: [
      {
        id: "event-1",
        title: "Admin Event",
        partnerId: "partner-1",
        partnerName: "Venue",
        dateLabel: "Tomorrow",
        codeStrategyLabel: "Secret code",
        ticketAvailabilityLabel: "10 tickets",
        creditPrice: 2,
        imageUrl: "https://example.com/event.jpg",
        exportAvailable: true,
        capacityLabel: "10/12",
        statusLabel: "Open",
      },
    ],
    partners: [
      {
        id: "partner-1",
        name: "Venue",
        address: "Berlin",
        contactEmail: "partner@example.com",
        logoInitial: "V",
        venueQrTokenLabel: "Token active",
        venueQrTokenStatus: "active",
        venueQrUrl: "/venue-check-in/token",
        portalLoginLabel: "partner@example.com",
        portalUserEmail: "partner@example.com",
      },
    ],
    members: [
      {
        userId: "user-1",
        fullName: "Member One",
        email: "member@example.com",
        roleLabel: "User",
        subscriptionStatusLabel: "Active",
        credits: 8,
        bookingCount: 1,
        eventOpenCount: 1,
        savedCount: 1,
        waitlistCount: 0,
        billingOverrideActions: ["freeze"],
        preferencesSummary: "3 preferences",
        historySummary: "1 bookings // 0 waitlist // 1 saved",
      },
    ],
    exportRows: [],
  };
}

function authenticatedViewer(input: {
  userId: string;
  partnerId?: string | null;
}): Viewer {
  return {
    kind: "authenticated",
    viewerContext: input.partnerId ? "partner" : "member",
    user: {
      id: input.userId,
      email: "user@example.com",
      name: "User",
      emailVerified: true,
    },
    role: input.partnerId ? "PARTNER" : "USER",
    partnerId: input.partnerId ?? null,
    language: "DE",
    credits: 0,
    subscriptionStatus: "ACTIVE",
    subscriptionPlan: "BASIC_BERLIN",
    onboardingComplete: false,
    savedCount: 0,
    firstName: "User",
    lastName: null,
    showProfile: true,
    showLogout: true,
  };
}
