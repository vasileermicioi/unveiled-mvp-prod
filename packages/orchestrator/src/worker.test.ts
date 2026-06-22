import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  appBarePathRedirect,
  isPublicHost,
  normalizeAppPath,
  ORCHESTRATOR_SECURITY_HEADERS,
} from "./index";
import worker, { type OrchestratorEnv, REDIRECT_PATHS } from "./worker";

function makeFetcher(impl: (request: Request) => Promise<Response>): Fetcher {
  const fetcher = {
    fetch: (input: RequestInfo) => {
      const request = input instanceof Request ? input : new Request(input);
      return impl(request);
    },
    connect() {
      throw new Error("not supported in test");
    },
  };
  return fetcher as unknown as Fetcher;
}

const originalFetch = globalThis.fetch;
const originalConsoleLog = console.log;
let logged: string[] = [];

beforeEach(() => {
  logged = [];
  console.log = (...args: unknown[]) => {
    logged.push(args.map((a) => String(a)).join(" "));
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.log = originalConsoleLog;
  mock.restore();
});

describe("orchestrator worker dispatch", () => {
  it("returns /healthz with 200 and body 'ok'", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/healthz"),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
    expect(response.headers.get("Content-Type")).toMatch(/text\/plain/);
  });

  it("forwards /api/* to the API service binding", async () => {
    const seen: Request[] = [];
    const api = makeFetcher(async (request) => {
      seen.push(request);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const env: OrchestratorEnv = { API: api };
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/openapi.json"),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(new URL(seen[0]!.url).pathname).toBe("/api/openapi.json");
  });

  it("forwards /app/* to the APP service binding", async () => {
    const seen: Request[] = [];
    const app = makeFetcher(async (request) => {
      seen.push(request);
      return new Response("<html>app</html>", { status: 200 });
    });
    const env: OrchestratorEnv = { APP: app };
    const response = await worker.fetch(
      new Request("https://unveiled.app/app/en/discover"),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(new URL(seen[0]!.url).pathname).toBe("/app/en/discover");
  });

  it("forwards everything else to the LANDING service binding", async () => {
    const seen: Request[] = [];
    const landing = makeFetcher(async (request) => {
      seen.push(request);
      return new Response("landing-hero", { status: 200 });
    });
    const env: OrchestratorEnv = { LANDING: landing };
    const response = await worker.fetch(
      new Request("https://unveiled.app/"),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(new URL(seen[0]!.url).pathname).toBe("/");
  });

  it("applies uniform security headers on non-API responses", async () => {
    const landing = makeFetcher(
      async () =>
        new Response("landing", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }),
    );
    const env: OrchestratorEnv = { LANDING: landing };
    const response = await worker.fetch(
      new Request("https://unveiled.app/"),
      env,
      {} as ExecutionContext,
    );
    for (const [name, value] of Object.entries(ORCHESTRATOR_SECURITY_HEADERS)) {
      expect(response.headers.get(name)).toBe(value);
    }
  });

  it("does not set CSP on API responses", async () => {
    const api = makeFetcher(
      async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const env: OrchestratorEnv = { API: api };
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/openapi.json"),
      env,
      {} as ExecutionContext,
    );
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("returns 301 for /api/health.json when host is public", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/health.json", {
        headers: { host: "unveiled.app" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe("/healthz");
  });

  it("returns 301 for /api/readiness.json when host is public", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/readiness.json", {
        headers: { host: "unveiled.app" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe("/readyz");
  });

  it("forwards /api/health.json to API binding when host is not public", async () => {
    const seen: Request[] = [];
    const api = makeFetcher(async (request) => {
      seen.push(request);
      return new Response(JSON.stringify({ ok: true, service: "api" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const env: OrchestratorEnv = { API: api };
    const response = await worker.fetch(
      new Request("https://internal.svc/api/health.json", {
        headers: { host: "internal.svc" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(200);
    expect(seen).toHaveLength(1);
  });

  it("forwards the inbound x-request-id via the service binding", async () => {
    const seen: Request[] = [];
    const api = makeFetcher(async (request) => {
      seen.push(request);
      return new Response("ok");
    });
    const env: OrchestratorEnv = { API: api };
    await worker.fetch(
      new Request("https://unveiled.app/api/openapi.json", {
        headers: { "x-request-id": "abc-123" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(seen[0]?.headers.get("x-request-id")).toBe("abc-123");
  });

  it("generates a requestId when the inbound request lacks x-request-id", async () => {
    const seen: Request[] = [];
    const api = makeFetcher(async (request) => {
      seen.push(request);
      return new Response("ok");
    });
    const env: OrchestratorEnv = { API: api };
    await worker.fetch(
      new Request("https://unveiled.app/api/openapi.json"),
      env,
      {} as ExecutionContext,
    );
    const rid = seen[0]?.headers.get("x-request-id");
    expect(rid).toBeTruthy();
    expect(rid?.length ?? 0).toBeGreaterThan(8);
  });

  it("emits one structured JSON log line per request", async () => {
    const landing = makeFetcher(async () => new Response("landing"));
    const env: OrchestratorEnv = { LANDING: landing };
    await worker.fetch(
      new Request("https://unveiled.app/"),
      env,
      {} as ExecutionContext,
    );
    const requestLog = logged.find((line) =>
      line.includes("orchestrator.request"),
    );
    expect(requestLog).toBeDefined();
    const parsed = JSON.parse(requestLog!);
    expect(parsed.service).toBe("unveiled-orchestrator");
    expect(parsed.message).toBe("orchestrator.request");
    expect(parsed.path).toBe("/");
    expect(typeof parsed.requestId).toBe("string");
    expect(typeof parsed.durationMs).toBe("number");
  });

  it("returns 503 when a service binding is missing", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/openapi.json"),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(503);
    expect(await response.text()).toContain("API");
  });

  it("isPublicHost recognises unveiled.app subdomains and localhost", () => {
    expect(isPublicHost("unveiled.app")).toBe(true);
    expect(isPublicHost("www.unveiled.app")).toBe(true);
    expect(isPublicHost("app.unveiled.app")).toBe(true);
    expect(isPublicHost("localhost:4320")).toBe(true);
    expect(isPublicHost("127.0.0.1:4320")).toBe(true);
    expect(isPublicHost("internal.svc")).toBe(false);
    expect(isPublicHost(null)).toBe(false);
  });

  it("REDIRECT_PATHS covers the deprecated endpoints", () => {
    expect(REDIRECT_PATHS.get("/api/health.json")).toBe("/healthz");
    expect(REDIRECT_PATHS.get("/api/readiness.json")).toBe("/readyz");
  });

  it("redirects bare /app to /app/en/ when no language preference is set", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/app", {
        headers: { host: "unveiled.app" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/app/en/");
  });

  it("redirects bare /app/ to /app/de/ when Accept-Language prefers German", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/app/", {
        headers: {
          host: "unveiled.app",
          "accept-language": "de-DE,de;q=0.9",
        },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/app/de/");
  });

  it("preserves the query string on the bare /app redirect", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/app?venuePartner=abc&venueToken=xyz", {
        headers: { host: "unveiled.app" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "/app/en/?venuePartner=abc&venueToken=xyz",
    );
  });

  it("does not redirect /app/<lang>/... paths", async () => {
    const seen: Request[] = [];
    const app = makeFetcher(async (request) => {
      seen.push(request);
      return new Response("app", { status: 200 });
    });
    const env: OrchestratorEnv = { APP: app };
    const response = await worker.fetch(
      new Request("https://unveiled.app/app/en/discover", {
        headers: { host: "unveiled.app" },
      }),
      env,
      {} as ExecutionContext,
    );
    expect(response.status).toBe(200);
    expect(seen).toHaveLength(1);
  });

  it("appBarePathRedirect returns null for non-bare paths", () => {
    const request = new Request("https://unveiled.app/app/en/");
    expect(appBarePathRedirect("/app/en/", "", request)).toBeNull();
    expect(appBarePathRedirect("/app/en/discover", "", request)).toBeNull();
    expect(appBarePathRedirect("/", "", request)).toBeNull();
  });

  it("appBarePathRedirect picks the lang from the unveiled_lang cookie when present", () => {
    const request = new Request("https://unveiled.app/app", {
      headers: { cookie: "unveiled_lang=DE" },
    });
    expect(appBarePathRedirect("/app", "", request)).toBe("/app/de/");
  });
});

describe("normalizeAppPath", () => {
  function makeRequest(acceptLanguage?: string): Request {
    const headers: Record<string, string> = {};
    if (acceptLanguage) headers["accept-language"] = acceptLanguage;
    return new Request("https://unveiled.app/", { headers });
  }

  it("normalizes /en/admin to /app/en/admin", () => {
    expect(normalizeAppPath("/en/admin", makeRequest())).toBe("/app/en/admin");
  });

  it("normalizes /de to /app/de", () => {
    expect(normalizeAppPath("/de", makeRequest())).toBe("/app/de");
  });

  it("normalizes /en/ to /app/en/", () => {
    expect(normalizeAppPath("/en/", makeRequest())).toBe("/app/en/");
  });

  it("normalizes /en/admin/events to /app/en/admin/events", () => {
    expect(normalizeAppPath("/en/admin/events", makeRequest())).toBe(
      "/app/en/admin/events",
    );
  });

  it("normalizes /discover to /app/en/discover (default English)", () => {
    expect(normalizeAppPath("/discover", makeRequest())).toBe(
      "/app/en/discover",
    );
  });

  it("normalizes /discover to /app/de/discover (Accept-Language: de)", () => {
    expect(normalizeAppPath("/discover", makeRequest("de-DE,de;q=0.9"))).toBe(
      "/app/de/discover",
    );
  });

  it("normalizes /admin to /app/en/admin", () => {
    expect(normalizeAppPath("/admin", makeRequest())).toBe("/app/en/admin");
  });

  it("normalizes /membership to /app/en/membership", () => {
    expect(normalizeAppPath("/membership", makeRequest())).toBe(
      "/app/en/membership",
    );
  });

  it("returns null for canonical /app/en/admin (no redirect)", () => {
    expect(normalizeAppPath("/app/en/admin", makeRequest())).toBeNull();
  });

  it("returns null for /app (canonical, handled by appBarePathRedirect)", () => {
    expect(normalizeAppPath("/app", makeRequest())).toBeNull();
  });

  it("returns null for /api/openapi.json", () => {
    expect(normalizeAppPath("/api/openapi.json", makeRequest())).toBeNull();
  });

  it("returns null for /healthz", () => {
    expect(normalizeAppPath("/healthz", makeRequest())).toBeNull();
  });

  it("returns null for /readyz", () => {
    expect(normalizeAppPath("/readyz", makeRequest())).toBeNull();
  });

  it("returns null for / (landing home)", () => {
    expect(normalizeAppPath("/", makeRequest())).toBeNull();
  });

  it("returns null for /ladle/index.html", () => {
    expect(normalizeAppPath("/ladle/index.html", makeRequest())).toBeNull();
  });

  it("returns null for /favicon.ico", () => {
    expect(normalizeAppPath("/favicon.ico", makeRequest())).toBeNull();
  });

  it("returns null for /logos/unveiled-logo-black.svg", () => {
    expect(
      normalizeAppPath("/logos/unveiled-logo-black.svg", makeRequest()),
    ).toBeNull();
  });

  it("returns null for /fonts/EKNoticeSans-Black.woff2", () => {
    expect(
      normalizeAppPath("/fonts/EKNoticeSans-Black.woff2", makeRequest()),
    ).toBeNull();
  });

  it("returns null for /@vite/client", () => {
    expect(normalizeAppPath("/@vite/client", makeRequest())).toBeNull();
  });

  it("returns null for /_astro/something.js", () => {
    expect(normalizeAppPath("/_astro/something.js", makeRequest())).toBeNull();
  });

  it("returns null for unknown bare paths (e.g. /foo)", () => {
    expect(normalizeAppPath("/foo", makeRequest())).toBeNull();
  });
});
