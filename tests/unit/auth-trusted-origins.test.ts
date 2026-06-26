import { describe, expect, it } from "bun:test";

import {
  getSecretReadiness,
  resolveBaseURL,
  resolveTrustedOrigins,
} from "@unveiled/api/env";

describe("resolveTrustedOrigins", () => {
  it("includes the dev fallback set when no env is set", () => {
    const origins = resolveTrustedOrigins({});
    expect(origins).toContain("http://localhost:4320");
    expect(origins).toContain("http://127.0.0.1:4320");
    expect(origins).toContain("http://localhost:8787");
  });

  it("appends PUBLIC_APP_URL and PUBLIC_ORCHESTRATOR_URL when set", () => {
    const origins = resolveTrustedOrigins({
      PUBLIC_APP_URL: "https://app.unveiled.com",
      PUBLIC_ORCHESTRATOR_URL: "https://unveiled.com",
    });
    expect(origins).toContain("https://app.unveiled.com");
    expect(origins).toContain("https://unveiled.com");
    expect(origins).toContain("http://localhost:4320");
  });

  it("parses comma-separated BETTER_AUTH_TRUSTED_ORIGINS and dedupes", () => {
    const origins = resolveTrustedOrigins({
      BETTER_AUTH_TRUSTED_ORIGINS:
        "https://app.unveiled.com, https://admin.unveiled.com ,https://app.unveiled.com",
      PUBLIC_APP_URL: "https://app.unveiled.com",
    });
    const appCount = origins.filter(
      (origin) => origin === "https://app.unveiled.com",
    ).length;
    expect(appCount).toBe(1);
    expect(origins).toContain("https://admin.unveiled.com");
    expect(origins).toContain("http://localhost:4320");
  });
});

describe("resolveBaseURL", () => {
  it("prefers BETTER_AUTH_URL when set", () => {
    expect(
      resolveBaseURL({
        BETTER_AUTH_URL: "https://app.unveiled.com",
        PUBLIC_BETTER_AUTH_URL: "https://other.example.com",
        PUBLIC_ORCHESTRATOR_URL: "https://unveiled.com",
      }),
    ).toBe("https://app.unveiled.com");
  });

  it("falls back to PUBLIC_ORCHESTRATOR_URL in production-like envs", () => {
    expect(
      resolveBaseURL({ PUBLIC_ORCHESTRATOR_URL: "https://unveiled.com" }),
    ).toBe("https://unveiled.com");
  });

  it("falls back to the dev proxy when no env is set", () => {
    expect(resolveBaseURL({})).toBe("http://localhost:4320");
  });
});

describe("getSecretReadiness", () => {
  it("reports trustedOrigins >= 1 in every fixture", () => {
    expect(
      getSecretReadiness({
        BETTER_AUTH_URL: undefined,
        PUBLIC_BETTER_AUTH_URL: undefined,
        PUBLIC_ORCHESTRATOR_URL: undefined,
        BETTER_AUTH_TRUSTED_ORIGINS: "",
      }).trustedOrigins,
    ).toBeGreaterThanOrEqual(1);
    expect(
      getSecretReadiness({
        BETTER_AUTH_URL: undefined,
        PUBLIC_BETTER_AUTH_URL: undefined,
        PUBLIC_ORCHESTRATOR_URL: undefined,
        BETTER_AUTH_TRUSTED_ORIGINS:
          "https://app.unveiled.com,https://admin.unveiled.com",
      }).trustedOrigins,
    ).toBeGreaterThanOrEqual(1);
  });

  it("reports baseUrl as the resolved orchestrator URL when set", () => {
    expect(
      getSecretReadiness({
        BETTER_AUTH_URL: undefined,
        PUBLIC_BETTER_AUTH_URL: undefined,
        PUBLIC_ORCHESTRATOR_URL: "https://unveiled.com",
      }).baseUrl,
    ).toBe("https://unveiled.com");
  });

  it("reports baseUrl as the dev proxy when nothing is set", () => {
    expect(
      getSecretReadiness({
        BETTER_AUTH_URL: undefined,
        PUBLIC_BETTER_AUTH_URL: undefined,
        PUBLIC_ORCHESTRATOR_URL: undefined,
      }).baseUrl,
    ).toBe("http://localhost:4320");
  });

  it("reports authSecret as a boolean", () => {
    const withSecret = getSecretReadiness({
      BETTER_AUTH_URL: undefined,
      PUBLIC_BETTER_AUTH_URL: undefined,
      PUBLIC_ORCHESTRATOR_URL: undefined,
      BETTER_AUTH_SECRET: "x",
    });
    expect(typeof withSecret.authSecret).toBe("boolean");
    expect(withSecret.authSecret).toBe(true);
  });
});
