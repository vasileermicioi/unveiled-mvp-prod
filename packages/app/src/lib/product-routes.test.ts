import { describe, expect, test } from "bun:test";

import type { AuthenticatedViewer, Viewer } from "~/lib/auth-profile";

import {
  parseSafeRedirectTarget,
  productRoutes,
  redirectAfterLoginFor,
  resolveMemberOnboardingRoute,
  resolveRouteOwnership,
  routePathFor,
} from "./product-routes";

describe("product route ownership", () => {
  test("guests can render public routes", () => {
    expect(
      resolveRouteOwnership(guestViewer(), productRoutes.discover),
    ).toMatchObject({
      ok: true,
      route: { path: "/discover", owner: "public" },
    });
  });

  test("guests are redirected before protected route rendering", () => {
    expect(resolveRouteOwnership(guestViewer(), productRoutes.member)).toEqual({
      ok: false,
      redirectTo: "/",
      status: 302,
    });
  });

  test("partners are redirected from member and admin routes to partner portal", () => {
    const viewer = partnerViewer("partner-1");

    expect(resolveRouteOwnership(viewer, productRoutes.member)).toEqual({
      ok: false,
      redirectTo: "/partner",
      status: 302,
    });
    expect(resolveRouteOwnership(viewer, productRoutes.admin)).toEqual({
      ok: false,
      redirectTo: "/partner",
      status: 302,
    });
  });

  test("admins are redirected from partner and member routes to admin", () => {
    const viewer = adminViewer();

    expect(resolveRouteOwnership(viewer, productRoutes.partner)).toEqual({
      ok: false,
      redirectTo: "/admin",
      status: 302,
    });
    expect(resolveRouteOwnership(viewer, productRoutes.profile)).toEqual({
      ok: false,
      redirectTo: "/admin",
      status: 302,
    });
  });

  test("route paths expose stable navigation targets", () => {
    expect(routePathFor("member")).toBe("/app");
    expect(routePathFor("onboarding")).toBe("/onboarding");
    expect(routePathFor("how")).toBe("/how-it-works");
  });

  test("incomplete members are routed through onboarding before member surfaces", () => {
    const viewer = {
      ...authenticatedViewer("USER", "member", null),
      onboardingComplete: false,
    };

    expect(resolveMemberOnboardingRoute(viewer, productRoutes.member)).toEqual({
      ok: false,
      redirectTo: "/onboarding",
      status: 302,
    });
    expect(resolveMemberOnboardingRoute(viewer, productRoutes.saved)).toEqual({
      ok: false,
      redirectTo: "/onboarding",
      status: 302,
    });
  });

  test("completed members are redirected away from onboarding", () => {
    const viewer = authenticatedViewer("USER", "member", null);

    expect(
      resolveMemberOnboardingRoute(viewer, productRoutes.onboarding),
    ).toEqual({
      ok: false,
      redirectTo: "/app",
      status: 302,
    });
  });
});

describe("parseSafeRedirectTarget", () => {
  test("accepts a known product route with the matching language prefix", () => {
    const target = parseSafeRedirectTarget(
      "/en/bookings?status=upcoming",
      "EN",
    );
    expect(target).toEqual({
      id: "bookings",
      path: "/bookings",
      owner: "member",
    });
  });

  test("rejects absolute URLs", () => {
    expect(parseSafeRedirectTarget("https://evil.example/x", "EN")).toBeNull();
    expect(parseSafeRedirectTarget("http://evil.example/x", "EN")).toBeNull();
    expect(parseSafeRedirectTarget("javascript:alert(1)", "EN")).toBeNull();
  });

  test("rejects protocol-relative URLs", () => {
    expect(parseSafeRedirectTarget("//evil.example/x", "EN")).toBeNull();
    expect(parseSafeRedirectTarget("\\\\evil.example/x", "EN")).toBeNull();
  });

  test("rejects paths that are not in the productRoutes table", () => {
    expect(parseSafeRedirectTarget("/en/admin-but-not", "EN")).toBeNull();
    expect(parseSafeRedirectTarget("/not-a-route", "EN")).toBeNull();
    expect(parseSafeRedirectTarget("bookings", "EN")).toBeNull();
  });

  test("rejects cross-language prefix values", () => {
    expect(parseSafeRedirectTarget("/en/bookings", "DE")).toBeNull();
    expect(parseSafeRedirectTarget("/de/bookings", "EN")).toBeNull();
  });

  test("rejects empty and missing values", () => {
    expect(parseSafeRedirectTarget("", "EN")).toBeNull();
    expect(parseSafeRedirectTarget(null, "EN")).toBeNull();
    expect(parseSafeRedirectTarget(undefined, "EN")).toBeNull();
  });

  test("rejects percent-decoded bypass attempts", () => {
    expect(parseSafeRedirectTarget("%2F%2Fevil.example%2Fx", "EN")).toBeNull();
  });
});

describe("redirectAfterLoginFor", () => {
  test("returns undefined when the viewer is allowed on the requested owner", () => {
    expect(
      redirectAfterLoginFor(
        authenticatedViewer("USER", "member", null),
        "member",
      ),
    ).toBeUndefined();
    expect(
      redirectAfterLoginFor(
        authenticatedViewer("PARTNER", "partner", "p-1"),
        "partner",
      ),
    ).toBeUndefined();
    expect(
      redirectAfterLoginFor(
        authenticatedViewer("ADMIN", "admin", null),
        "admin",
      ),
    ).toBeUndefined();
  });

  test("returns the member safe destination when a Member visits an admin route", () => {
    const member = authenticatedViewer("USER", "member", null);
    expect(redirectAfterLoginFor(member, "admin")).toBe("/app");
  });

  test("returns the public landing when a Member visits a partner route", () => {
    const member = authenticatedViewer("USER", "member", null);
    expect(redirectAfterLoginFor(member, "partner")).toBe("/");
  });

  test("returns the partner safe destination when a Partner visits an admin route", () => {
    const partner = authenticatedViewer("PARTNER", "partner", "p-1");
    expect(redirectAfterLoginFor(partner, "admin")).toBe("/partner");
  });

  test("returns the admin safe destination when an Admin visits a partner route", () => {
    const admin = authenticatedViewer("ADMIN", "admin", null);
    expect(redirectAfterLoginFor(admin, "partner")).toBe("/admin");
    expect(redirectAfterLoginFor(admin, "member")).toBe("/admin");
  });

  test("returns the public landing for an authenticated viewer with no matching role", () => {
    const partner = authenticatedViewer("PARTNER", "partner", "p-1");
    expect(redirectAfterLoginFor(partner, "member")).toBe("/partner");
  });
});

function guestViewer(): Viewer {
  return {
    kind: "guest",
    viewerContext: "guest",
    language: "EN",
  };
}

function partnerViewer(partnerId: string): Viewer {
  return authenticatedViewer("PARTNER", "partner", partnerId);
}

function adminViewer(): Viewer {
  return authenticatedViewer("ADMIN", "admin", null);
}

function authenticatedViewer(
  role: "USER" | "ADMIN" | "PARTNER",
  viewerContext: "member" | "admin" | "partner",
  partnerId: string | null,
): AuthenticatedViewer {
  return {
    kind: "authenticated",
    viewerContext,
    user: {
      id: `${viewerContext}-user`,
      email: `${viewerContext}@example.com`,
      name: `${viewerContext} User`,
      emailVerified: true,
    },
    role,
    partnerId,
    language: "EN",
    credits: 0,
    subscriptionStatus: "ACTIVE",
    subscriptionPlan: "BASIC_BERLIN",
    onboardingComplete: true,
    savedCount: 0,
    firstName: viewerContext,
    lastName: "User",
    showProfile: role === "USER",
    showLogout: true,
  };
}
