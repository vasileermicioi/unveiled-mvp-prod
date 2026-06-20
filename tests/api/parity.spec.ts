import { expect, test } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321";

const FIXTURES: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
}[] = [
  { path: "/api/health.json" },
  { path: "/api/readiness.json" },
  { path: "/api/openapi.json" },
];

test.describe("service-binding /api/* parity", () => {
  for (const fixture of FIXTURES) {
    test(`GET ${fixture.path} returns the same shape the API Worker returns`, async ({
      request,
    }) => {
      const response = await request.get(`${BASE}${fixture.path}`, {
        failOnStatusCode: false,
      });
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(500);
      const contentType = response.headers()["content-type"] ?? "";
      expect(contentType.length).toBeGreaterThan(0);
      const body = await response.text();
      expect(body.length).toBeGreaterThan(0);
    });
  }

  test("service binding forwards the request to the API Worker", async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/api/health.json`, {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { ok?: boolean };
    expect(body.ok).toBe(true);
  });

  test("/api/* short-circuit does not run the language guard", async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/api/health.json`, {
      failOnStatusCode: false,
      maxRedirects: 0,
      headers: { "accept-language": "de-DE,de;q=0.9" },
    });
    expect(response.status()).not.toBe(302);
  });
});
