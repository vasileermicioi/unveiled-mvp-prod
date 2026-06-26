import { withSecurityHeaders } from "./logging";
import type { OrchestratorEnv } from "./worker";

const READINESS_TIMEOUT_MS = 1000;

// Each `path` MUST match the `createRoute({ path })` declaration in
// `packages/api/src/routes/{system,app,landing}/...` for the corresponding
// surface. Any future rename in either location MUST be mirrored here.
const SURFACE_PROBES = [
  { surface: "api", binding: "API", path: "/api/readiness.json" },
  { surface: "app", binding: "APP", path: "/app/_health" },
  { surface: "landing", binding: "LANDING", path: "/_health" },
] as const;

type SurfaceName = (typeof SURFACE_PROBES)[number]["surface"];

type SurfaceStatus = "ok" | "error" | "timeout" | "missing_binding";

type ReadinessEnvelope = {
  status: "ok" | "degraded";
  surfaces: Record<SurfaceName, SurfaceStatus>;
  failing: string[];
};

type ApiReadinessPayload = {
  ok?: boolean;
  failing?: string[];
  probes?: Record<string, { ok: boolean }>;
};

type OrchestratorBindings = {
  API?: Fetcher;
  APP?: Fetcher;
  LANDING?: Fetcher;
};

function buildProbeRequest(path: string): Request {
  return new Request(`https://orchestrator.invalid${path}`, {
    method: "GET",
    headers: { "x-request-id": "readiness-probe" },
  });
}

async function probeSurface(
  _surface: SurfaceName,
  binding: keyof OrchestratorBindings,
  path: string,
  env: OrchestratorBindings,
): Promise<SurfaceStatus> {
  const target = env[binding];
  if (!target) return "missing_binding";
  try {
    const response = await Promise.race([
      target.fetch(buildProbeRequest(path)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), READINESS_TIMEOUT_MS),
      ),
    ]);
    return response.ok ? "ok" : "error";
  } catch (err) {
    return err instanceof Error && err.message === "timeout"
      ? "timeout"
      : "error";
  }
}

function probeFailingFromApi(
  apiSurface: SurfaceStatus,
  payload: ApiReadinessPayload | null,
): string[] {
  if (apiSurface !== "ok" || !payload) return [];
  if (Array.isArray(payload.failing)) return payload.failing;
  if (payload.probes) {
    return Object.entries(payload.probes)
      .filter(([, probe]) => probe && probe.ok === false)
      .map(([name]) => name);
  }
  return [];
}

async function checkReadiness(env: OrchestratorEnv): Promise<Response> {
  const v2Enabled =
    env.READINESS_PROBE_V2 === "1" || env.READINESS_PROBE_V2 === "true";

  const results = await Promise.all(
    SURFACE_PROBES.map((probe) =>
      probeSurface(probe.surface, probe.binding, probe.path, env),
    ),
  );
  const surfaces = {} as Record<SurfaceName, SurfaceStatus>;
  let allOk = true;
  for (let i = 0; i < SURFACE_PROBES.length; i++) {
    const probe = SURFACE_PROBES[i];
    const status = results[i];
    surfaces[probe.surface] = status;
    if (status !== "ok") allOk = false;
  }

  let apiPayload: ApiReadinessPayload | null = null;
  if (v2Enabled && env.API && surfaces.api === "ok") {
    try {
      const response = await Promise.race([
        env.API.fetch(buildProbeRequest("/api/readiness.json")),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), READINESS_TIMEOUT_MS),
        ),
      ]);
      if (response.ok) {
        apiPayload = (await response.json()) as ApiReadinessPayload;
      }
    } catch {
      apiPayload = null;
    }
  }

  const probeFailing = probeFailingFromApi(surfaces.api, apiPayload);
  const failingSurfaces = (
    Object.entries(surfaces) as [SurfaceName, SurfaceStatus][]
  )
    .filter(([, status]) => status !== "ok")
    .map(([name]) => `surface:${name}`);
  const failing = [
    ...failingSurfaces,
    ...probeFailing.map((p) => `probe:${p}`),
  ];

  const envelope: ReadinessEnvelope = {
    status: allOk && probeFailing.length === 0 ? "ok" : "degraded",
    surfaces,
    failing,
  };
  const response = new Response(JSON.stringify(envelope), {
    status: envelope.status === "ok" ? 200 : 503,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
  return withSecurityHeaders(response, "/readyz");
}

export default {
  async fetch(
    request: Request,
    env: OrchestratorEnv,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    if (new URL(request.url).pathname !== "/readyz") {
      return new Response("Not Found", { status: 404 });
    }
    return checkReadiness(env);
  },
} satisfies ExportedHandler<OrchestratorEnv>;

export type { ReadinessEnvelope, SurfaceName, SurfaceStatus };
export { checkReadiness, READINESS_TIMEOUT_MS, SURFACE_PROBES };
