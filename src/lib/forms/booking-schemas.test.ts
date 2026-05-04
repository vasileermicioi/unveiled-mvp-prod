import { describe, expect, test } from "bun:test";

import {
  adminTicketSchema,
  bookingActionSchema,
  creditAdjustmentSchema,
  waitlistActionSchema,
} from "@/lib/forms/schemas";

describe("booking action schemas", () => {
  test("accepts member booking action input", () => {
    expect(
      bookingActionSchema.safeParse({
        eventId: "event-1",
        ticketQuantity: 3,
        idempotencyKey: "retry-key",
      }).success,
    ).toBe(true);
  });

  test("rejects invalid booking quantity", () => {
    expect(
      bookingActionSchema.safeParse({
        eventId: "event-1",
        ticketQuantity: 4,
        idempotencyKey: "retry-key",
      }).success,
    ).toBe(false);
  });

  test("defaults waitlist quantity", () => {
    const parsed = waitlistActionSchema.safeParse({ eventId: "event-1" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.ticketQuantity).toBe(1);
  });

  test("accepts admin ticket options", () => {
    expect(
      adminTicketSchema.safeParse({
        userId: "user-1",
        eventId: "event-1",
        ticketQuantity: 1,
        consumeCapacity: false,
        debitCredits: true,
      }).success,
    ).toBe(true);
  });

  test("requires credit adjustment reason", () => {
    expect(
      creditAdjustmentSchema.safeParse({
        userId: "user-1",
        amount: 1,
        reason: "",
      }).success,
    ).toBe(false);
  });
});
