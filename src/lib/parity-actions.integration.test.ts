import { describe, expect, test } from "bun:test";

import {
  bookingActionResult,
  checkInBookingActionSuccess,
  creditAdjustmentActionResult,
  preferencesActionSuccess,
  profileActionSuccess,
  safeActionFailure,
  saveEventActionSuccess,
  saveMemberEventActionSuccess,
  savePartnerActionSuccess,
  toggleUserFreezeActionSuccess,
  unsaveMemberEventActionSuccess,
  venueQrCheckInActionSuccess,
} from "@/lib/action-contracts";
import { AuthAccessError, authFailure } from "@/lib/auth-profile";
import { dataQueryKeys } from "@/lib/data-access/query-keys";
import { queryKeys } from "@/lib/forms/query-keys";
import { parityFixtureIds } from "@/lib/testing/parity-fixtures";

describe("parity action contracts", () => {
  test("returns safe authorization failures", () => {
    expect(
      safeActionFailure(new AuthAccessError(authFailure("unauthenticated"))),
    ).toEqual({
      ok: false,
      formError: "Authentication required.",
    });

    expect(safeActionFailure(new Error("boom"))).toEqual({
      ok: false,
      formError: "The request could not be completed.",
    });
  });

  test("covers member profile, preferences, save, and unsave invalidation", () => {
    const userId = parityFixtureIds.users.activeMember;
    const eventId = parityFixtureIds.events.public;

    const profile = profileActionSuccess(userId);
    const preferences = preferencesActionSuccess(userId);
    const save = saveMemberEventActionSuccess(userId, eventId);
    const unsave = unsaveMemberEventActionSuccess(userId, eventId);

    expect(profile.invalidate).toContainEqual(queryKeys.profile(userId));
    expect(profile.invalidate).toContainEqual(queryKeys.authViewer);
    expect(profile.invalidate).toContainEqual(
      dataQueryKeys.memberProfile(userId),
    );

    expect(preferences.invalidate).toContainEqual(
      dataQueryKeys.memberPreferences(userId),
    );

    expect(save.invalidate).toContainEqual(queryKeys.events);
    expect(save.invalidate).toContainEqual(queryKeys.event(eventId));
    expect(save.invalidate).toContainEqual(dataQueryKeys.publicDiscovery());

    expect(unsave.invalidate).toContainEqual(queryKeys.event(eventId));
    expect(unsave.invalidate).toContainEqual(dataQueryKeys.publicDiscovery());
  });

  test("covers booking and waitlist visible invalidation", () => {
    const bookingResult = bookingActionResult({
      state: "confirmed",
      bookingId: "booking-1",
      userId: parityFixtureIds.users.activeMember,
      eventId: parityFixtureIds.events.secret,
      ticketQuantity: 1,
      totalCredits: 3,
      redemption: {
        type: "SECRET_CODE",
        code: "PARITY-SECRET",
      },
    });
    const waitlistResult = bookingActionResult({
      state: "waitlist",
      waitlistEntryId: "waitlist-1",
      userId: parityFixtureIds.users.activeMember,
      eventId: parityFixtureIds.events.soldOut,
      ticketQuantity: 1,
      status: "WAITING",
    });

    expect(bookingResult).toMatchObject({
      ok: true,
      notice: { message: "Booking confirmed." },
    });
    if (!bookingResult.ok)
      throw new Error("Expected confirmed booking result.");
    expect(bookingResult.invalidate).toContainEqual(queryKeys.bookings);
    expect(bookingResult.invalidate).toContainEqual(queryKeys.ledger());
    expect(bookingResult.invalidate).toContainEqual(
      dataQueryKeys.memberBookings(parityFixtureIds.users.activeMember),
    );
    expect(bookingResult.invalidate).toContainEqual(
      dataQueryKeys.publicDiscovery(),
    );

    expect(waitlistResult).toMatchObject({
      ok: true,
      notice: { message: "Waitlist joined." },
    });
    if (!waitlistResult.ok) throw new Error("Expected waitlist result.");
    expect(waitlistResult.invalidate).toContainEqual(queryKeys.waitlist);
  });

  test("covers partner and admin operational invalidation", () => {
    const partner = savePartnerActionSuccess(
      parityFixtureIds.partner,
      "Partner saved.",
    );
    const event = saveEventActionSuccess(
      [parityFixtureIds.events.public],
      "Event saved.",
    );
    const freeze = toggleUserFreezeActionSuccess(
      { userId: parityFixtureIds.users.activeMember, frozen: true },
      "Member frozen.",
    );
    const partnerCheckIn = checkInBookingActionSuccess(
      parityFixtureIds.bookings.confirmed,
      parityFixtureIds.partner,
      "Guest checked in.",
    );
    const venueCheckIn = venueQrCheckInActionSuccess(
      parityFixtureIds.bookings.confirmed,
      parityFixtureIds.partner,
      parityFixtureIds.users.activeMember,
      "Venue check-in complete.",
    );

    if (
      !partner.ok ||
      !event.ok ||
      !freeze.ok ||
      !partnerCheckIn.ok ||
      !venueCheckIn.ok
    ) {
      throw new Error("Expected operational action contracts to succeed.");
    }

    expect(partner.invalidate).toContainEqual(dataQueryKeys.adminPartners());
    expect(partner.invalidate).toContainEqual(
      dataQueryKeys.partnerPortal(parityFixtureIds.partner),
    );

    expect(event.invalidate).toContainEqual(dataQueryKeys.adminEvents());
    expect(event.invalidate).toContainEqual(
      queryKeys.event(parityFixtureIds.events.public),
    );

    expect(freeze.invalidate).toContainEqual(
      dataQueryKeys.adminMember(parityFixtureIds.users.activeMember),
    );
    expect(freeze.invalidate).toContainEqual(
      dataQueryKeys.bookingEligibility(parityFixtureIds.users.activeMember),
    );

    expect(partnerCheckIn.invalidate).toContainEqual(
      dataQueryKeys.partnerGuests(parityFixtureIds.partner),
    );
    expect(partnerCheckIn.invalidate).toContainEqual(
      dataQueryKeys.partnerExports(parityFixtureIds.partner),
    );

    expect(venueCheckIn.invalidate).toContainEqual(
      dataQueryKeys.memberBookings(parityFixtureIds.users.activeMember),
    );
    expect(venueCheckIn.invalidate).toContainEqual(
      dataQueryKeys.partnerGuests(parityFixtureIds.partner),
    );
  });

  test("covers credit-adjustment invalidation", () => {
    const adjustment = creditAdjustmentActionResult({
      state: "adjusted",
      userId: parityFixtureIds.users.activeMember,
      amount: 2,
      balanceAfter: 10,
      ledgerEntryId: "ledger-1",
    });

    expect(adjustment).toMatchObject({
      ok: true,
      notice: { message: "Credits adjusted." },
    });
    if (!adjustment.ok) throw new Error("Expected credit adjustment result.");
    expect(adjustment.invalidate).toContainEqual(queryKeys.adminMembers);
    expect(adjustment.invalidate).toContainEqual(
      dataQueryKeys.bookingEligibility(parityFixtureIds.users.activeMember),
    );
  });
});
