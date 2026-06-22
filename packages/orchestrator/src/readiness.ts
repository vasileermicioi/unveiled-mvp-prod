import { withSecurityHeaders } from "./logging";

const READINESS_TIMEOUT_MS = 1000;

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
  surface: SurfaceName,
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

async function checkReadiness(env: OrchestratorBindings): Promise<Response> {
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
  const envelope: ReadinessEnvelope = {
    status: allOk ? "ok" : "degraded",
    surfaces,
  };
  const response = new Response(JSON.stringify(envelope), {
    status: allOk ? 200 : 503,
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
    env: OrchestratorBindings,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    if (new URL(request.url).pathname !== "/readyz") {
      return new Response("Not Found", { status: 404 });
    }
    return checkReadiness(env);
  },
} satisfies ExportedHandler<OrchestratorBindings>;

export type { ReadinessEnvelope, SurfaceName, SurfaceStatus };
export { checkReadiness, READINESS_TIMEOUT_MS, SURFACE_PROBES };
