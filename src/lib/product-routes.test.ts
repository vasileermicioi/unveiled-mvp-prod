import { describe, expect, test } from "bun:test";

import type { AuthenticatedViewer, Viewer } from "@/lib/auth-profile";

import {
  productRoutes,
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
