import { env as cloudflareEnv } from "cloudflare:workers";
import type { APIRoute } from "astro";

import { checkDatabaseConnection } from "@/db/client";
import { getRuntimeEnv, getSecretReadiness } from "@/lib/env";

function isAuthorized(
  request: Request,
  env: Record<string, string | undefined>,
) {
  const token = getRuntimeEnv(env).READINESS_TOKEN;
  if (!token) return true;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${token}`;
}

export const GET: APIRoute = async ({ locals, request }) => {
  const env = getRuntimeEnv({
    ...((locals as { env?: Record<string, string | undefined> }).env ?? {}),
    ...(cloudflareEnv as Record<string, string | undefined>),
  });

  if (!isAuthorized(request, env)) {
    return Response.json(
      { ok: false, status: "unauthorized" },
      { status: 401 },
    );
  }

  const config = getSecretReadiness(env);
  const missing = Object.entries(config)
    .filter(([key, present]) => key !== "resendApiKey" && !present)
    .map(([key]) => key);

  if (missing.length > 0) {
    return Response.json(
      {
        ok: false,
        status: "configuration_failed",
        missing,
      },
      { status: 503 },
    );
  }

  try {
    await checkDatabaseConnection(env);
  } catch {
    return Response.json(
      {
        ok: false,
        status: "database_failed",
      },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    status: "ready",
    dependencies: {
      database: "ok",
      auth: "configured",
      resend: config.resendApiKey ? "configured" : "missing_optional",
    },
  });
};
