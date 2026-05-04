import { describe, expect, test } from "bun:test";

import { isOperationFailure } from "@/lib/admin-operations";

describe("admin operation result helpers", () => {
  test("identifies safe operation failures", () => {
    expect(
      isOperationFailure({
        state: "unauthorized",
        message: "You do not have access to this resource.",
      }),
    ).toBe(true);
  });

  test("keeps success results distinct from typed failures", () => {
    expect(
      isOperationFailure({
        state: "success",
        message: "Guest checked in.",
        bookingId: "booking-1",
      }),
    ).toBe(false);
  });
});
