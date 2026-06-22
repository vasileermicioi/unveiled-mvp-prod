import { describe, expect, it } from "bun:test";
import worker, {
  REDIRECT_PATHS,
  type OrchestratorEnv,
} from "../../packages/orchestrator/src/worker";
import { isPublicHost } from "../../packages/orchestrator/src/index";

function ctx(): ExecutionContext {
  return {} as ExecutionContext;
}

describe("orchestrator public health/readiness replacement", () => {
  it("returns 200 'ok' from /healthz without invoking any binding", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/healthz", {
        headers: { host: "unveiled.app" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  it("applies security headers on /healthz", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/healthz"),
      env,
      ctx(),
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=");
  });

  it("redirects /api/health.json to /healthz", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/health.json", {
        headers: { host: "unveiled.app" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe("/healthz");
  });

  it("redirects /api/readiness.json to /readyz", async () => {
    const env: OrchestratorEnv = {};
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/readiness.json", {
        headers: { host: "unveiled.app" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe("/readyz");
  });

  it("does not redirect when the host is not public (preserves service-binding reachability)", async () => {
    let apiCalls = 0;
    const api = {
      fetch: async () => {
        apiCalls += 1;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
      connect() {
        throw new Error("not supported");
      },
    } as unknown as Fetcher;
    const env: OrchestratorEnv = { API: api };
    const response = await worker.fetch(
      new Request("https://internal.svc/api/health.json", {
        headers: { host: "internal.svc" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(200);
    expect(apiCalls).toBe(1);
  });

  it("REDIRECT_PATHS only covers the deprecated JSON endpoints", () => {
    expect([...REDIRECT_PATHS.keys()].sort()).toEqual([
      "/api/health.json",
      "/api/readiness.json",
    ]);
  });

  it("isPublicHost whitelists unveiled.app and localhost hosts", () => {
    expect(isPublicHost("unveiled.app")).toBe(true);
    expect(isPublicHost("app.unveiled.app")).toBe(true);
    expect(isPublicHost("localhost:4320")).toBe(true);
    expect(isPublicHost("127.0.0.1:4320")).toBe(true);
    expect(isPublicHost("evil.example")).toBe(false);
    expect(isPublicHost(null)).toBe(false);
  });
});