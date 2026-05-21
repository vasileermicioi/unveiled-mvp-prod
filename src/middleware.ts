import { defineMiddleware } from "astro:middleware";
import { getViewer } from "@/lib/auth-profile";
import { trackSessionInDb } from "@/lib/behavior-tracking";
import {
  resolveMemberOnboardingRoute,
  routeForPath,
} from "@/lib/product-routes";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, redirect } = context;

  // Skip middleware for API routes and static assets
  if (url.pathname.startsWith("/api") || url.pathname.includes(".")) {
    return next();
  }

  const route = routeForPath(url.pathname);
  if (!route) {
    return next();
  }

  try {
    const viewer = await getViewer(request);
    if (viewer.kind === "authenticated") {
      try {
        await trackSessionInDb(viewer.user.id);
      } catch (err) {
        console.error("Failed to track session:", err);
      }
    }
    const outcome = resolveMemberOnboardingRoute(viewer, route);

    if (!outcome.ok) {
      return redirect(outcome.redirectTo, outcome.status);
    }
  } catch (_error) {
    // If there's an auth error (like profile_missing), redirect to landing
    return redirect("/", 302);
  }

  return next();
});
