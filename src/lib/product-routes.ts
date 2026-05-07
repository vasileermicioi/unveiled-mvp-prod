import type { ShellNavItemId } from "@/lib/app-shell-view-models";
import type { AuthenticatedViewer, Viewer } from "@/lib/auth-profile";

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
  return Object.values(productRoutes).find((route) => route.path === pathname);
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

  const redirectTo = redirectForAuthenticatedViewer(viewer, route.owner);
  if (redirectTo) {
    return { ok: false, redirectTo, status: 302 };
  }

  return { ok: true, viewer, route };
}

function redirectForAuthenticatedViewer(
  viewer: AuthenticatedViewer,
  owner: ProductRouteOwner,
) {
  if (owner === "member") {
    return viewer.role === "USER"
      ? undefined
      : routePathFor(viewer.viewerContext);
  }

  if (owner === "partner") {
    if (viewer.role === "PARTNER" && viewer.partnerId) return undefined;
    return viewer.role === "ADMIN" ? routePathFor("admin") : "/";
  }

  if (owner === "admin") {
    if (viewer.role === "ADMIN") return undefined;
    return viewer.role === "PARTNER" ? routePathFor("partner") : "/";
  }

  return undefined;
}
