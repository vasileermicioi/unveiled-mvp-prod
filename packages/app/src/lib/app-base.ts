export const APP_BASE_PREFIX = "/app";

export function stripAppBase(pathname: string): string {
  if (pathname === APP_BASE_PREFIX) return "/";
  if (pathname.startsWith(`${APP_BASE_PREFIX}/`)) {
    return pathname.slice(APP_BASE_PREFIX.length) || "/";
  }
  return pathname;
}
