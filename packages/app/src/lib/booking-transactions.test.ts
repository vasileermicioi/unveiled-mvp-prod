import { describe, expect, test } from "bun:test";

import {
  bookingFailureMessage,
  bookingRequestFingerprint,
  resolveRedemption,
} from "~/lib/booking-transactions";

const baseEvent = {
  id: "event-123",
  ticketType: "SECRET_CODE" as const,
  secretCodeMode: "MANUAL" as const,
  secretCode: "UNVEILED",
  promoCode: null,
  eventWebsiteUrl: null,
};

describe("booking transaction helpers", () => {
  test("creates stable idempotency fingerprints", () => {
    expect(
      bookingRequestFingerprint({
        eventId: "event-1",
        ticketQuantity: 2,
      }),
    ).toBe(
      bookingRequestFingerprint({
        ticketQuantity: 2,
        eventId: "event-1",
      }),
    );
  });

  test("resolves manual secret code redemption", () => {
    expect(resolveRedemption(baseEvent, "booking-1")).toEqual({
      type: "SECRET_CODE",
      code: "UNVEILED",
    });
  });

  test("resolves shared generated secret code redemption", () => {
    expect(
      resolveRedemption(
        {
          ...baseEvent,
          secretCodeMode: "SHARED_GENERATED",
          secretCode: null,
        },
        "booking-1",
      ),
    ).toEqual({
      type: "SECRET_CODE",
      code: "UNV-EVENT123",
    });
  });

  test("resolves unique per booking secret code redemption", () => {
    expect(
      resolveRedemption(
        {
          ...baseEvent,
          secretCodeMode: "UNIQUE_PER_BOOKING",
          secretCode: null,
        },
        "booking-abc-123",
      ),
    ).toEqual({
      type: "SECRET_CODE",
      code: "UNV-BOOKINGABC",
    });
  });

  test("resolves voucher redemption with URL", () => {
    expect(
      resolveRedemption(
        {
          ...baseEvent,
          ticketType: "VOUCHER",
          promoCode: "UNV-BER-25",
          eventWebsiteUrl: "https://partner.example",
        },
        "booking-1",
      ),
    ).toEqual({
      type: "VOUCHER",
      code: "UNV-BER-25",
      url: "https://partner.example",
    });
  });

  test("rejects unsupported redemption setup", () => {
    const result = resolveRedemption(
      {
        ...baseEvent,
        secretCode: null,
      },
      "booking-1",
    );

    expect("state" in result ? result.state : null).toBe(
      "unsupported_redemption_setup",
    );
  });

  test("maps typed failure states to user-safe messages", () => {
    expect(bookingFailureMessage("sold_out")).toBe("This event is sold out.");
    expect(bookingFailureMessage("invalid_quantity")).toBe(
      "Select between 1 and 3 tickets.",
    );
  });
});
