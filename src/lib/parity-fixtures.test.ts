import { describe, expect, test } from "bun:test";

import {
  assertNoDemoFixtureLabels,
  createGuestViewer,
  createParityViewer,
  parityDemoOnlyLabels,
  parityFixtureEmails,
  parityFixtureIds,
} from "@/lib/testing/parity-fixtures";

describe("parity fixtures", () => {
  test("exposes deterministic user, partner, and event identifiers", () => {
    expect(parityFixtureEmails.activeMember).toContain("parity.member.active");
    expect(parityFixtureIds.partner).toBe("parity-partner-venue");
    expect(parityFixtureIds.events.secret).toBe("parity-event-secret");
  });

  test("asserts when known demo-only labels leak into production text", () => {
    expect(() =>
      assertNoDemoFixtureLabels(parityDemoOnlyLabels.join(" // ")),
    ).toThrow("Unexpected demo fixture label found");
  });

  test("creates consistent guest and authenticated viewers", () => {
    expect(createGuestViewer()).toEqual({
      kind: "guest",
      viewerContext: "guest",
      language: "DE",
    });

    expect(
      createParityViewer({
        userId: parityFixtureIds.users.partner,
        email: parityFixtureEmails.partner,
        role: "PARTNER",
        partnerId: parityFixtureIds.partner,
      }),
    ).toMatchObject({
      viewerContext: "partner",
      role: "PARTNER",
      partnerId: parityFixtureIds.partner,
      showProfile: false,
    });
  });
});
