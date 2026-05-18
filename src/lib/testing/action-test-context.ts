import type { ActionAPIContext } from "astro:actions";

function setCookieHeaders(source: Headers) {
  const getSetCookie = (source as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  const values = getSetCookie ? getSetCookie.call(source) : [];
  const fallback = source.get("set-cookie");
  return values.length ? values : fallback ? [fallback] : [];
}

export function headersFromActionSession(source: Headers) {
  const cookiePairs = setCookieHeaders(source)
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter((cookie): cookie is string => Boolean(cookie));

  const headers = new Headers();
  if (cookiePairs.length > 0) {
    headers.set("cookie", cookiePairs.join("; "));
  }
  return headers;
}

export function createActionTestContext(
  headers = new Headers(),
  url = "http://127.0.0.1/__parity_action__",
) {
  const cookieJar = new Map<string, string>();
  const requestCookieHeader = headers.get("cookie");
  if (requestCookieHeader) {
    for (const part of requestCookieHeader.split(";")) {
      const [name, ...rest] = part.trim().split("=");
      if (!name || rest.length === 0) continue;
      cookieJar.set(name, rest.join("="));
    }
  }

  const context = {
    request: new Request(url, { method: "POST", headers }),
    cookies: {
      get(name: string) {
        const value = cookieJar.get(name);
        return value ? { name, value } : undefined;
      },
      set(name: string, value: string) {
        cookieJar.set(name, value);
      },
      delete(name: string) {
        cookieJar.delete(name);
      },
    },
    locals: {},
  };
  return context as unknown as ActionAPIContext;
}
