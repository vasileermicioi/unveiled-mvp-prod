import { describe, expect, test } from "bun:test";
import { APP_BASE_PREFIX } from "~/lib/app-base";
import { createShellFromViewer } from "~/lib/auth-display";
import {
  createGuestViewer,
  createParityViewer,
  parityFixtureEmails,
  parityFixtureIds,
} from "~/lib/testing/parity-fixtures";

describe("createShellFromViewer primaryAction", () => {
  test("guest sees a 'Become a member' primary action", () => {
    const shell = createShellFromViewer(createGuestViewer(), "discover");
    expect(shell.primaryAction).toMatchObject({
      id: "membership",
      label: "Mitglied werden",
      targetHref: `${APP_BASE_PREFIX}/de/membership`,
    });
  });

  test("authenticated member sees an 'Open app' primary action", () => {
    const shell = createShellFromViewer(
      createParityViewer({
        userId: parityFixtureIds.users.activeMember,
        email: parityFixtureEmails.activeMember,
        role: "USER",
      }),
      "discover",
    );
    expect(shell.primaryAction).toMatchObject({
      id: "open-app",
      label: "App öffnen",
      targetHref: `${APP_BASE_PREFIX}/de/app`,
      variant: "primary",
    });
  });

  test("authenticated partner sees an 'Open app' primary action to /partner", () => {
    const shell = createShellFromViewer(
      createParityViewer({
        userId: parityFixtureIds.users.partner,
        email: parityFixtureEmails.partner,
        role: "PARTNER",
        partnerId: parityFixtureIds.partner,
      }),
      "discover",
    );
    expect(shell.primaryAction).toMatchObject({
      id: "open-app",
      label: "App öffnen",
      targetHref: `${APP_BASE_PREFIX}/de/partner`,
      variant: "primary",
    });
  });

  test("authenticated admin sees an 'Open app' primary action to /admin", () => {
    const shell = createShellFromViewer(
      createParityViewer({
        userId: parityFixtureIds.users.admin,
        email: parityFixtureEmails.admin,
        role: "ADMIN",
      }),
      "discover",
    );
    expect(shell.primaryAction).toMatchObject({
      id: "open-app",
      label: "App öffnen",
      targetHref: `${APP_BASE_PREFIX}/de/admin`,
      variant: "primary",
    });
  });
});
