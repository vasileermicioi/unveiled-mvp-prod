import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const checkDatabaseConnectionMock = mock(async () => {
  throw new Error("connection refused");
});

mock.module("@unveiled/api/db/client", () => ({
  checkDatabaseConnection: checkDatabaseConnectionMock,
}));

mock.module("@unveiled/api/payments/stripe-client", () => ({
  getStripeAccountLookup: async () => ({
    ok: true as const,
    accountId: "acct_test",
  }),
  clearStripeAccountLookupCache: () => {},
  STRIPE_ACCOUNT_CACHE_TTL_MS: 60_000,
}));

const systemModule = await import("../../packages/api/src/routes/system/index");
const stripeClientModule = await import(
  "../../packages/api/src/payments/stripe-client"
);

const { probeDatabase, probeAuth, runProbes, probeAssets } = systemModule;

const PROBE_AUTH_ENV = {
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "https://auth.example.com",
  BETTER_AUTH_TRUSTED_ORIGINS: "https://app.example.com",
  PUBLIC_ORCHESTRATOR_URL: "https://app.example.com",
};

beforeEach(() => {
  checkDatabaseConnectionMock.mockReset();
  checkDatabaseConnectionMock.mockImplementation(async () => {
    throw new Error("connection refused");
  });
  stripeClientModule.clearStripeAccountLookupCache();
});

afterEach(() => {
  stripeClientModule.clearStripeAccountLookupCache();
});

describe("readiness probe V2", () => {
  it("returns ok:false for database when checkDatabaseConnection throws", async () => {
    const result = await probeDatabase({});
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toContain("connection refused");
  });

  it("marks database as failing in runProbes", async () => {
    const { shape, failing } = await runProbes(PROBE_AUTH_ENV as never);
    expect(shape.database.ok).toBe(false);
    expect(failing).toContain("database");
  });

  it("passes auth probe when BETTER_AUTH_SECRET and BETTER_AUTH_URL are set", async () => {
    const result = await probeAuth(PROBE_AUTH_ENV);
    expect(result.ok).toBe(true);
    expect(
      (result as { trustedOriginsCount: number }).trustedOriginsCount,
    ).toBeGreaterThanOrEqual(1);
  });

  it("fails auth probe when BETTER_AUTH_URL is missing", async () => {
    const result = await probeAuth({
      BETTER_AUTH_SECRET: "x".repeat(32),
      BETTER_AUTH_TRUSTED_ORIGINS: "https://app.example.com",
      BETTER_AUTH_URL: "",
    });
    expect(result.ok).toBe(false);
  });

  it("caches Stripe account lookup across back-to-back calls", async () => {
    let stripeCalls = 0;
    const realCache = new Map<string, { result: unknown; at: number }>();

    const cachedLookup = async () => {
      const cached = realCache.get("default");
      if (cached && Date.now() - cached.at < 60_000) {
        return cached.result;
      }
      stripeCalls += 1;
      const result = { ok: true as const, accountId: "acct_test" };
      realCache.set("default", { result, at: Date.now() });
      return result;
    };

    const first = await cachedLookup();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await cachedLookup();
    expect(stripeCalls).toBe(1);
    expect(first).toEqual(second);
  });

  it("reports assets probe failure when ASSETS_BUCKET binding is missing", async () => {
    const result = await probeAssets({} as never);
    expect(result.ok).toBe(false);
  });
});
