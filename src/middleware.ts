import { defineMiddleware } from "astro:middleware";
import { getViewer } from "@/lib/auth-profile";
import { trackSessionInDb } from "@/lib/behavior-tracking";
import { logger } from "@/lib/logger";
import { normalizeLanguage, type UiLanguage } from "@/lib/i18n";
import {
  resolveMemberOnboardingRoute,
  routeForPath,
} from "@/lib/product-routes";

export const PENDING_TRACE_ID = "pending-trace-id";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, redirect } = context;
  const route = routeForPath(url.pathname);
  const traceId = PENDING_TRACE_ID;
  context.locals.traceId = traceId;
  context.locals.logger = logger.child({
    traceId,
    route: route?.id ?? "unknown",
  });

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

    let detectedLang: UiLanguage = "EN";
    const cookieLang = cookieHeader?.match(/unveiled_lang=(DE|EN)/i)?.[1];
    if (cookieLang) {
      detectedLang = normalizeLanguage(cookieLang);
    } else {
      const isGerman = acceptLanguage?.toLowerCase().includes("de");
      detectedLang = isGerman ? "DE" : "EN";
    }

    const lang = detectedLang.toLowerCase();
    // Redirect to prefixed URL preserving query params
    return redirect(`/${lang}${url.pathname}${url.search}`, 302);
  }

  if (!route) {
    return next();
  }

  const currentLang = match[1].toLowerCase() as UiLanguage;
  const langPrefix = `/${currentLang.toLowerCase()}`;

  if (route.owner === "public") {
    return next();
  }

  try {
    const viewer = await getViewer(request);
    if (viewer.kind === "authenticated") {
      try {
        await trackSessionInDb(viewer.user.id);
      } catch (err) {
        context.locals.logger.error("session_track_failed", { err });
      }
    }
    const outcome = resolveMemberOnboardingRoute(viewer, route);

    if (!outcome.ok) {
      return redirect(`${langPrefix}${outcome.redirectTo}`, outcome.status);
    }
  } catch (_error) {
    // If there's an auth error (like profile_missing), redirect to landing
    return redirect(`${langPrefix}/`, 302);
  }

  return next();
});
