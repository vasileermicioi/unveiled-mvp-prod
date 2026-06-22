import {
  appBarePathRedirect,
  isPublicHost,
  normalizeAppPath,
  ORCHESTRATOR_SECURITY_HEADERS,
} from "./index";
import {
  logError,
  logRequest,
  requestIdFor,
  withRequestIdHeader,
  withSecurityHeaders,
} from "./logging";
import checkReadinessDefault from "./readiness";

const REDIRECT_PATHS = new Map<string, string>([
  ["/api/health.json", "/healthz"],
  ["/api/readiness.json", "/readyz"],
]);

function redirectResponse(location: string, status = 301): Response {
  return new Response(`Redirecting to ${location}`, {
    status,
    headers: { Location: location },
  });
}

function livenessResponse(): Response {
  const response = new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  return withSecurityHeaders(response, "/healthz");
}

async function dispatch(
  request: Request,
  env: OrchestratorEnv,
  binding: keyof OrchestratorBindings,
  requestPath: string,
): Promise<Response> {
  const target = env[binding] as Fetcher | undefined;
  if (!target) {
    return withSecurityHeaders(
      new Response(`Service binding '${binding}' is not configured`, {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }),
      requestPath,
    );
  }
  const response = await target.fetch(request);
  return withSecurityHeaders(response, requestPath);
}

export type OrchestratorBindings = {
  API?: Fetcher;
  APP?: Fetcher;
  LANDING?: Fetcher;
};

export type OrchestratorEnv = OrchestratorBindings & {
  READINESS_PROBE?: Fetcher;
  [key: string]: unknown;
};

export default {
  async fetch(
    request: Request,
    env: OrchestratorEnv,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const requestId = requestIdFor(request);
    const taggedRequest = withRequestIdHeader(request, requestId);
    const startedAt = Date.now();

    try {
      let response: Response;

      if (path === "/healthz") {
        response = livenessResponse();
      } else if (path === "/readyz") {
        const envBindings: OrchestratorBindings = {
          API: env.API,
          APP: env.APP,
          LANDING: env.LANDING,
        };
        response = await checkReadinessDefault.fetch(
          taggedRequest,
          envBindings,
          _ctx,
        );
        response = withSecurityHeaders(response, path);
      } else {
        const redirect = REDIRECT_PATHS.get(path);
        if (redirect && isPublicHost(request.headers.get("host"))) {
          response = redirectResponse(redirect);
        } else if (path.startsWith("/api/")) {
          response = await dispatch(taggedRequest, env, "API", path);
        } else if (path === "/app" || path === "/app/") {
          const target = appBarePathRedirect(path, url.search, request);
          response = target
            ? redirectResponse(target, 302)
            : await dispatch(taggedRequest, env, "APP", path);
        } else if (path.startsWith("/app/")) {
          response = await dispatch(taggedRequest, env, "APP", path);
        } else {
          const normalized = normalizeAppPath(path, request);
          if (normalized) {
            response = withSecurityHeaders(
              new Response(null, {
                status: 302,
                headers: { Location: normalized },
              }),
              path,
            );
          } else {
            response = await dispatch(taggedRequest, env, "LANDING", path);
          }
        }
      }

      logRequest({
        requestId,
        method: request.method,
        path,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (err) {
      logError({
        requestId,
        method: request.method,
        path,
        durationMs: Date.now() - startedAt,
        error: err,
      });
      return withSecurityHeaders(
        new Response("Internal Server Error", {
          status: 500,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
        path,
      );
    }
  },
} satisfies ExportedHandler<OrchestratorEnv>;

export { ORCHESTRATOR_SECURITY_HEADERS, REDIRECT_PATHS };
