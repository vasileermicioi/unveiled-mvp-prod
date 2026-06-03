import { defineMiddleware } from "astro:middleware";
import { getViewer } from "@/lib/auth-profile";
import { trackSessionInDb } from "@/lib/behavior-tracking";
import {
  resolveMemberOnboardingRoute,
  routeForPath,
} from "@/lib/product-routes";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, redirect } = context;

  // Skip middleware for API routes, Astro internals, and static assets
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_") ||
    url.pathname.includes(".")
  ) {
    return next();
  }

  const match = url.pathname.match(/^\/(de|en)(?=\/|$)/i);
  if (!match) {
    // Detect language from cookie, header, or default
    const cookieHeader = request.headers.get("cookie");
    const acceptLanguage = request.headers.get("accept-language");

    let detectedLang = "EN";
    const cookieLang = cookieHeader?.match(/unveiled_lang=(DE|EN)/i)?.[1];
    if (cookieLang) {
      detectedLang = cookieLang.toUpperCase();
    } else {
      const isGerman = acceptLanguage?.toLowerCase().includes("de");
      detectedLang = isGerman ? "DE" : "EN";
    }

    const lang = detectedLang.toLowerCase();
    // Redirect to prefixed URL preserving query params
    return redirect(`/${lang}${url.pathname}${url.search}`, 302);
  }

  const route = routeForPath(url.pathname);
  if (!route) {
    return next();
  }

  const currentLang = match[1].toLowerCase();

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
      return redirect(`/${currentLang}${outcome.redirectTo}`, outcome.status);
    }
  } catch (_error) {
    // If there's an auth error (like profile_missing), redirect to landing
    return redirect(`/${currentLang}/`, 302);
  }

  return next();
});
