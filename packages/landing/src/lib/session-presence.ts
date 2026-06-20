import type { AstroGlobal } from "astro";

const SESSION_COOKIE_NAMES = [
  "unveiled.session_token",
  "better-auth.session_token",
  "session",
] as const;

function readCookie(
  astro: Pick<AstroGlobal, "request">,
  name: string,
): string | null {
  const header = astro.request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export function hasSessionCookie(astro: Pick<AstroGlobal, "request">): boolean {
  for (const name of SESSION_COOKIE_NAMES) {
    if (readCookie(astro, name)) return true;
  }
  return false;
}
