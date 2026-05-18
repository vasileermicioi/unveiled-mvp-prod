import { describe, expect, test } from "bun:test";

import {
  getAuthRedirectPath,
  requireOwnerOrAdmin,
  requirePartnerForResource,
} from "@/lib/auth-profile";
import {
  createParityViewer,
  parityFixtureEmails,
  parityFixtureIds,
} from "@/lib/testing/parity-fixtures";

describe("parity auth route coverage", () => {
  test("preserves venue check-in callback URLs for authenticated members", () => {
    const nextPath = getAuthRedirectPath(
      createParityViewer({
        userId: parityFixtureIds.users.activeMember,
        email: parityFixtureEmails.activeMember,
        role: "USER",
      }),
      `/venue-check-in/${parityFixtureIds.partner}?token=PARITY-VENUE-CHECK-IN`,
    );

    expect(nextPath).toBe(
      `/venue-check-in/${parityFixtureIds.partner}?token=PARITY-VENUE-CHECK-IN`,
    );
  });

  test("partner ownership helper rejects mismatched partner scope", async () => {
    const error = await captureError(() =>
      requirePartnerForResource(
        createParityViewer({
          userId: parityFixtureIds.users.partner,
          email: parityFixtureEmails.partner,
          role: "PARTNER",
          partnerId: parityFixtureIds.partner,
        }),
        "another-partner",
      ),
    );

    expect(error).toMatchObject({ code: "forbidden", status: 403 });
  });

  test("owner-or-admin helper rejects non-owner members", async () => {
    const error = await captureError(() =>
      requireOwnerOrAdmin(
        createParityViewer({
          userId: parityFixtureIds.users.activeMember,
          email: parityFixtureEmails.activeMember,
          role: "USER",
        }),
        parityFixtureIds.users.frozenMember,
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
