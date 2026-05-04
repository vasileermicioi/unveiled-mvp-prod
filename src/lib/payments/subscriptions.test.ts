import { describe, expect, test } from "bun:test";

import {
  calculateNoRolloverRefill,
  deriveSubscriptionStatus,
  isBookingAvailableForStatus,
} from "@/lib/payments/subscriptions";

describe("payment subscription helpers", () => {
  test("derives local subscription states from provider and admin state", () => {
    expect(deriveSubscriptionStatus("active")).toBe("ACTIVE");
    expect(deriveSubscriptionStatus("trialing")).toBe("ACTIVE");
    expect(deriveSubscriptionStatus("past_due")).toBe("PAST_DUE");
    expect(deriveSubscriptionStatus("unpaid")).toBe("UNPAID");
    expect(deriveSubscriptionStatus("canceled")).toBe("INACTIVE");
    expect(deriveSubscriptionStatus("incomplete")).toBe("INCOMPLETE");
    expect(deriveSubscriptionStatus("active", true)).toBe("ADMIN_FROZEN");
  });

  test("freezes booking availability for non-active states", () => {
    expect(isBookingAvailableForStatus("ACTIVE")).toBe(true);
    expect(isBookingAvailableForStatus("PAST_DUE")).toBe(false);
    expect(isBookingAvailableForStatus("UNPAID")).toBe(false);
    expect(isBookingAvailableForStatus("ADMIN_FROZEN")).toBe(false);
  });

  test("calculates no-rollover monthly refill amounts", () => {
    expect(calculateNoRolloverRefill(0, 10)).toBe(10);
    expect(calculateNoRolloverRefill(4, 10)).toBe(6);
    expect(calculateNoRolloverRefill(10, 10)).toBe(0);
    expect(calculateNoRolloverRefill(13, 10)).toBe(0);
  });

  test("migration includes provider and refill uniqueness assertions", async () => {
    const migration = await Bun.file("drizzle/0003_eager_sway.sql").text();

    expect(migration).toContain("provider_events_provider_event_id_unique");
    expect(migration).toContain(
      "credit_ledger_entries_refill_idempotency_key_unique",
    );
  });
});
