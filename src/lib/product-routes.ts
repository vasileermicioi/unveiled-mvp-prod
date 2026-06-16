import type { ShellNavItemId } from "@/lib/app-shell-view-models";
import type { AuthenticatedViewer, Viewer } from "@/lib/auth-profile";
import type { UiLanguage } from "@/lib/i18n";

export type ProductRouteOwner = "public" | "member" | "partner" | "admin";

export type ProductRouteDefinition = {
  id: ShellNavItemId;
  path: string;
  owner: ProductRouteOwner;
};

export type RouteOwnershipOutcome =
  | { ok: true; viewer: Viewer; route: ProductRouteDefinition }
  | { ok: false; redirectTo: string; status: 302 };

export const productRoutes = {
  landing: { id: "landing", path: "/", owner: "public" },
  discover: { id: "discover", path: "/discover", owner: "public" },
  how: { id: "how", path: "/how-it-works", owner: "public" },
  membership: { id: "membership", path: "/membership", owner: "public" },
  faq: { id: "faq", path: "/faq", owner: "public" },
  member: { id: "member", path: "/app", owner: "member" },
  onboarding: { id: "onboarding", path: "/onboarding", owner: "member" },
  saved: { id: "saved", path: "/saved", owner: "member" },
  bookings: { id: "bookings", path: "/bookings", owner: "member" },
  profile: { id: "profile", path: "/profile", owner: "member" },
  partner: { id: "partner", path: "/partner", owner: "partner" },
  admin: { id: "admin", path: "/admin", owner: "admin" },
} satisfies Record<ShellNavItemId, ProductRouteDefinition>;

export function routePathFor(itemId: ShellNavItemId) {
  return productRoutes[itemId].path;
}

export function routeForPath(
  pathname: string,
): ProductRouteDefinition | undefined {
  const cleanPath = pathname.replace(/^\/(?:de|en)(?=\/|$)/i, "") || "/";
  return Object.values(productRoutes).find((route) => route.path === cleanPath);
}

export function resolveRouteOwnership(
  viewer: Viewer,
  route: ProductRouteDefinition,
): RouteOwnershipOutcome {
  if (route.owner === "public") {
    return { ok: true, viewer, route };
  }

  if (viewer.kind === "guest") {
    return { ok: false, redirectTo: "/", status: 302 };
  }

  const redirectTo = redirectAfterLoginFor(viewer, route.owner);
  if (redirectTo) {
    return { ok: false, redirectTo, status: 302 };
  }

  return { ok: true, viewer, route };
}

export function resolveMemberOnboardingRoute(
  viewer: Viewer,
  route: ProductRouteDefinition,
): RouteOwnershipOutcome {
  const ownership = resolveRouteOwnership(viewer, route);
  if (!ownership.ok) return ownership;

  if (
    ownership.viewer.kind === "authenticated" &&
    ownership.viewer.role === "USER"
  ) {
    const onboardingPath = routePathFor("onboarding");
    const memberPath = routePathFor("member");
    if (!ownership.viewer.onboardingComplete && route.path !== onboardingPath) {
      return { ok: false, redirectTo: onboardingPath, status: 302 };
    }
    if (ownership.viewer.onboardingComplete && route.path === onboardingPath) {
      return { ok: false, redirectTo: memberPath, status: 302 };
    }
  }

  return ownership;
}

export function redirectAfterLoginFor(
  viewer: AuthenticatedViewer,
  owner: ProductRouteOwner,
): string | undefined {
  if (owner === "member") {
    if (viewer.role === "USER") return undefined;
    if (viewer.role === "PARTNER") return routePathFor("partner");
    if (viewer.role === "ADMIN") return routePathFor("admin");
    return "/";
  }

  if (owner === "partner") {
    if (viewer.role === "PARTNER" && viewer.partnerId) return undefined;
    if (viewer.role === "ADMIN") return routePathFor("admin");
    return "/";
  }

  if (owner === "admin") {
    if (viewer.role === "ADMIN") return undefined;
    if (viewer.role === "PARTNER" && viewer.partnerId)
      return routePathFor("partner");
    if (viewer.role === "PARTNER") return routePathFor("partner");
    if (viewer.role === "USER") return routePathFor("member");
    return "/";
  }

  return undefined;
}

export function parseSafeRedirectTarget(
  input: string | null | undefined,
  viewerLanguage: UiLanguage,
): ProductRouteDefinition | null {
  if (typeof input !== "string") return null;
  if (input.length === 0) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    return null;
  }

  if (/^\s*[a-z][a-z0-9+.-]*:/i.test(decoded)) return null;
  if (decoded.startsWith("//")) return null;
  if (decoded.startsWith("/\\")) return null;

  const match = decoded.match(/^(\/(de|en))(?=\/|$)/i);
  const pathLang = match
    ? (match[1].slice(1).toUpperCase() as UiLanguage)
    : undefined;
  const remainder = match ? decoded.slice(match[1].length) || "/" : decoded;
  if (!remainder.startsWith("/")) return null;

  const pathOnly = remainder.split("?")[0] || "/";
  const route = routeForPath(pathOnly);
  if (!route) return null;
  if (pathLang && pathLang !== viewerLanguage) return null;

  return route;
}
