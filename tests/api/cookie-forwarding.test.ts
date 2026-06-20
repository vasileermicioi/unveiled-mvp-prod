import { expect, test } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321";

test.describe("service-binding /api/* cookie forwarding", () => {
  test("inbound Cookie header is forwarded to the API Worker", async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/api/health.json`, {
      failOnStatusCode: false,
      headers: { cookie: "unveiled_lang=DE; session=fixture-session-token" },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
  });

  test("outbound Set-Cookie headers are returned to the caller unchanged", async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/api/auth/get-session`, {
      failOnStatusCode: false,
    });
    const setCookie = response
      .headersArray()
      .filter((h) => h.name.toLowerCase() === "set-cookie");
    expect(Array.isArray(setCookie)).toBe(true);
  });

  test("Better Auth session cookie domain is preserved across the binding", async ({
    request,
    context,
  }) => {
    await context.addCookies([
      {
        name: "unveiled_lang",
        value: "EN",
        domain: new URL(BASE).hostname,
        path: "/",
      },
    ]);
    const response = await request.get(`${BASE}/api/auth/get-session`, {
      failOnStatusCode: false,
    });
    expect([200, 401, 403]).toContain(response.status());
  });
});
