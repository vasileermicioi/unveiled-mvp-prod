import { describe, expect, it } from "bun:test";
import { isPublicHost } from "../../packages/orchestrator/src/index";
import worker, {
  type OrchestratorEnv,
} from "../../packages/orchestrator/src/worker";

function ctx(): ExecutionContext {
  return {} as ExecutionContext;
}

function makeApiFetcher(): {
  fetcher: Fetcher;
  seen: Request[];
} {
  const seen: Request[] = [];
  const fetcher = {
    fetch: async (input: RequestInfo) => {
      const request = input instanceof Request ? input : new Request(input);
      seen.push(request);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
    connect() {
      throw new Error("not supported");
    },
  } as unknown as Fetcher;
  return { fetcher, seen };
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
    expect(response.headers.get("Strict-Transport-Security")).toContain(
      "max-age=",
    );
  });

  it("forwards /api/health.json to the API binding on the public hostname (deprecation window ended)", async () => {
    const { fetcher, seen } = makeApiFetcher();
    const env: OrchestratorEnv = { API: fetcher };
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/health.json", {
        headers: { host: "unveiled.app" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Location")).toBeNull();
    expect(seen).toHaveLength(1);
  });

  it("forwards /api/readiness.json to the API binding on the public hostname (deprecation window ended)", async () => {
    const { fetcher, seen } = makeApiFetcher();
    const env: OrchestratorEnv = { API: fetcher };
    const response = await worker.fetch(
      new Request("https://unveiled.app/api/readiness.json", {
        headers: { host: "unveiled.app" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Location")).toBeNull();
    expect(seen).toHaveLength(1);
  });

  it("forwards /api/health.json to API binding when host is not public (service-binding reachability)", async () => {
    const { fetcher, seen } = makeApiFetcher();
    const env: OrchestratorEnv = { API: fetcher };
    const response = await worker.fetch(
      new Request("https://internal.svc/api/health.json", {
        headers: { host: "internal.svc" },
      }),
      env,
      ctx(),
    );
    expect(response.status).toBe(200);
    expect(seen).toHaveLength(1);
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
