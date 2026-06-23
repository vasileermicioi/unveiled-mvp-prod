export const ORCHESTRATOR_VERSION = "0.0.0";

export const ORCHESTRATOR_HEALTH_PATH = "/healthz";
export const ORCHESTRATOR_READINESS_PATH = "/readyz";

export const ORCHESTRATOR_PUBLIC_HOSTNAME = "unveiled.app";

export const ORCHESTRATOR_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.stripe.com https://m.stripe.network https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://*.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

export const ORCHESTRATOR_SECURITY_HEADERS = {
  "Content-Security-Policy": ORCHESTRATOR_CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
} as const;

export const ORCHESTRATOR_DISPATCH = {
  apiPrefix: "/api/",
  appPrefix: "/app/",
  healthPath: ORCHESTRATOR_HEALTH_PATH,
  readinessPath: ORCHESTRATOR_READINESS_PATH,
  landingPrefix: "/",
} as const;

export type DispatchTarget = "API" | "APP" | "LANDING" | "HEALTH" | "READINESS";

export function dispatchTargetFor(pathname: string): DispatchTarget {
  if (pathname === ORCHESTRATOR_DISPATCH.healthPath) return "HEALTH";
  if (pathname === ORCHESTRATOR_DISPATCH.readinessPath) return "READINESS";
  if (pathname.startsWith(ORCHESTRATOR_DISPATCH.apiPrefix)) return "API";
  if (pathname.startsWith(ORCHESTRATOR_DISPATCH.appPrefix)) return "APP";
  return "LANDING";
}

export function isPublicHost(host: string | null): boolean {
  if (!host) return false;
  return (
    host === "unveiled.app" ||
    host === "www.unveiled.app" ||
    host.endsWith(".unveiled.app") ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1")
  );
}

export const SUPPORTED_APP_LANGS = ["en", "de"] as const;
export type AppLang = (typeof SUPPORTED_APP_LANGS)[number];
export const DEFAULT_APP_LANG: AppLang = "en";

export const APP_BARE_ROUTE_SEGMENTS = new Set<string>([
  "/discover",
  "/how-it-works",
  "/membership",
  "/faq",
  "/app",
  "/onboarding",
  "/saved",
  "/bookings",
  "/profile",
  "/partner",
  "/admin",
]);

export function pickLangFromRequest(request: Request): AppLang {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/unveiled_lang=(DE|EN)/i)?.[1];
    if (match) {
      return match.toUpperCase() === "DE" ? "de" : "en";
    }
  }
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage?.toLowerCase().includes("de")) {
    return "de";
  }
  return DEFAULT_APP_LANG;
}

export function appBarePathRedirect(
  pathname: string,
  search: string,
  request: Request,
): string | null {
  if (pathname !== "/app" && pathname !== "/app/") {
    return null;
  }
  const lang = pickLangFromRequest(request);
  return `/app/${lang}/${search}`;
}

export function normalizeAppPath(
  pathname: string,
  request: Request,
): string | null {
  if (pathname.startsWith("/app/") || pathname === "/app") return null;
  if (pathname.startsWith("/api/")) return null;
  if (pathname === ORCHESTRATOR_HEALTH_PATH) return null;
  if (pathname === ORCHESTRATOR_READINESS_PATH) return null;
  if (pathname.startsWith("/ladle/") || pathname === "/ladle") return null;
  if (pathname === "/favicon.ico" || pathname === "/favicon.svg") return null;
  if (pathname.startsWith("/logos/") || pathname.startsWith("/fonts/"))
    return null;
  if (pathname.startsWith("/_") || pathname.includes(".")) return null;
  if (pathname.startsWith("/@")) return null;

  const langMatch = pathname.match(/^\/(de|en)(\/.*)?$/);
  if (langMatch) {
    return `/app${pathname}`;
  }

  if (APP_BARE_ROUTE_SEGMENTS.has(pathname)) {
    const lang = pickLangFromRequest(request);
    return `/app/${lang}${pathname}`;
  }

  return null;
}
