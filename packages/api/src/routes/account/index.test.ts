import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";

const SESSION_COOKIE =
  "better-auth.session_token=seed-session; Path=/; HttpOnly; SameSite=Lax";
const CLEARED_COOKIE =
  "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

function buildCookieHeaders(cookie: string): Headers {
  const headers = new Headers();
  headers.append("set-cookie", cookie);
  return headers;
}

function headersToResponseInitStub(
  headers: Headers | undefined,
  fallbackStatus: 200 | 400 | 401 | 403 = 200,
): {
  headers: Record<string, string | string[]>;
  status: 200 | 400 | 401 | 403;
} {
  const source = headers ?? new Headers();
  const record: Record<string, string | string[]> = {};
  source.forEach((value, key) => {
    const lower = key.toLowerCase();
    const existing = record[lower];
    if (existing === undefined) {
      record[lower] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      record[lower] = [existing, value];
    }
  });
  const candidate = source as Headers & { getSetCookie?: () => string[] };
  const setCookies =
    typeof candidate.getSetCookie === "function"
      ? candidate.getSetCookie()
      : [];
  if (setCookies.length > 0) {
    record["set-cookie"] = setCookies.length === 1 ? setCookies[0] : setCookies;
  }
  if (!record["content-type"]) {
    record["content-type"] = "application/json";
  }
  return { headers: record, status: fallbackStatus };
}

mock.module("@unveiled/api/worker", () => ({
  getCloudflareEnv: () => ({}),
  AppType: class {} as never,
}));

mock.module("@unveiled/api/auth-account-actions", () => ({
  headersToResponseInit: headersToResponseInitStub,
  loginWithEmail: mock(async () => ({
    ok: true,
    headers: buildCookieHeaders(SESSION_COOKIE),
    userId: "user_seed",
    nextPath: "/app/en/discover",
    state: { status: "success", disabled: false, message: "Logged in." },
  })),
  signUpWithEmail: mock(async () => ({
    ok: true,
    headers: buildCookieHeaders(SESSION_COOKIE),
    userId: "user_seed_new",
    nextPath: "/app/en/discover",
    state: { status: "success", disabled: false, message: "Account created." },
  })),
  logout: mock(async () => ({
    ok: true,
    headers: buildCookieHeaders(CLEARED_COOKIE),
    state: { status: "success", disabled: false, message: "Logged out." },
    nextPath: "/",
  })),
  requestPasswordRecovery: mock(async () => ({
    ok: true,
    headers: new Headers(),
    state: {
      status: "success",
      disabled: false,
      message:
        "If an account exists for that email, recovery instructions will be sent.",
    },
  })),
}));

const { mountAccountRoutes } = await import("./index");
const { Hono } = await import("hono");

function buildApp() {
  const app = new Hono();
  app.use("*", async (c, next) => {
    c.set("runtimeEnv", {});
    await next();
  });
  mountAccountRoutes(
    app as unknown as Parameters<typeof mountAccountRoutes>[0],
  );
  return app;
}

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET ??= "test-secret-please-change-me";
  process.env.DATABASE_URL ??= "postgres://localhost/seed";
});

afterAll(() => {
  mock.restore();
});

describe("/api/account header propagation", () => {
  test("login response carries the Better Auth session cookie", async () => {
    const app = buildApp();
    const response = await app.request("/api/account/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "member@example.test",
        password: "correct horse battery",
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(
      "better-auth.session_token",
    );
    expect(response.headers.get("content-type")).toMatch(/application\/json/);

    const body = (await response.json()) as { ok: boolean; nextPath?: string };
    expect(body.ok).toBe(true);
    expect(body.nextPath).toBe("/app/en/discover");
  });

  test("signup response carries the Better Auth session cookie", async () => {
    const app = buildApp();
    const response = await app.request("/api/account/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "fresh@example.test",
        password: "correct horse battery",
        firstName: "Casey",
        lastName: "River",
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(
      "better-auth.session_token",
    );
  });

  test("logout response clears the Better Auth session cookie", async () => {
    const app = buildApp();
    const response = await app.request("/api/account/logout", {
      method: "POST",
      headers: { cookie: SESSION_COOKIE },
    });

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("better-auth.session_token");
    expect(setCookie?.toLowerCase()).toMatch(/expires=/);
  });

  test("headersToResponseInit preserves multiple set-cookie entries as an array", () => {
    const headers = new Headers();
    headers.append("set-cookie", "a=1; Path=/");
    headers.append("set-cookie", "b=2; Path=/");

    const init = headersToResponseInitStub(headers);

    expect(init.headers["set-cookie"]).toEqual(["a=1; Path=/", "b=2; Path=/"]);
    expect(init.headers["content-type"]).toBe("application/json");
    expect(init.status).toBe(200);
  });

  test("headersToResponseInit defaults content-type when missing", () => {
    const init = headersToResponseInitStub(new Headers());

    expect(init.headers["content-type"]).toBe("application/json");
    expect(init.headers["set-cookie"]).toBeUndefined();
  });
});
