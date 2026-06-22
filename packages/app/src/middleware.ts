import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { APP_BASE_PREFIX, stripAppBase } from "~/lib/app-base";
import { getViewer } from "~/lib/auth-profile";
import { trackSessionInDb } from "~/lib/behavior-tracking";
import { normalizeLanguage, type UiLanguage } from "~/lib/i18n";
import { logger } from "~/lib/logger";
import {
  resolveMemberOnboardingRoute,
  routeForPath,
} from "~/lib/product-routes";

export const PENDING_TRACE_ID = "pending-trace-id";

export { APP_BASE_PREFIX, stripAppBase };

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, redirect } = context;
  const internalPath = stripAppBase(url.pathname);
  const route = routeForPath(internalPath);
  const traceId = PENDING_TRACE_ID;
  context.locals.traceId = traceId;
  context.locals.logger = logger.child({
    traceId,
    route: route?.id ?? "unknown",
  });

  if (url.pathname.startsWith("/api/")) {
    return env.API.fetch(request);
  }

  if (url.pathname.startsWith("/_") || url.pathname.includes(".")) {
    return next();
  }

  const match = internalPath.match(/^\/(de|en)(?=\/|$)/i);
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
    return redirect(
      `${APP_BASE_PREFIX}/${lang}${internalPath}${url.search}`,
      302,
    );
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
      if (viewer.kind === "guest") {
        const postLangPath =
          internalPath.replace(/^\/(de|en)(?=\/|$)/i, "") || "/";
        const safeRedirect = encodeURIComponent(`${postLangPath}${url.search}`);
        return redirect(
          `${APP_BASE_PREFIX}${langPrefix}/login?redirect=${safeRedirect}`,
          outcome.status,
        );
      }
      return redirect(
        `${APP_BASE_PREFIX}${langPrefix}${outcome.redirectTo}`,
        outcome.status,
      );
    }
  } catch (_error) {
    if (_error instanceof Error && _error.message.includes("auth")) {
      const postLangPath =
        internalPath.replace(/^\/(de|en)(?=\/|$)/i, "") || "/";
      const safeRedirect = encodeURIComponent(`${postLangPath}${url.search}`);
      return redirect(
        `${APP_BASE_PREFIX}${langPrefix}/login?redirect=${safeRedirect}`,
        302,
      );
    }
    return redirect(`${APP_BASE_PREFIX}${langPrefix}/`, 302);
  }

  return next();
});
