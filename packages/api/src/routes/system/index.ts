// `openapiYamlSource` is a string literal produced at build time by the
// `inlineOpenApiYamlPlugin` esbuild plugin (see `packages/api/src/openapi.ts`
// and `packages/api/scripts/build.ts`). The plugin replaces the placeholder
// below with the contents of `typespec/output/openapi.yaml` so the Workers
// runtime never touches `node:fs`/`node:path`.
const openapiYamlSource = "__INLINE_OPENAPI_YAML__";

import { createRoute } from "@hono/zod-openapi";

import { checkDatabaseConnection } from "@unveiled/api/db/client";
import { getSecretReadiness } from "@unveiled/api/env";
import type { AppType } from "@unveiled/api/worker";
import { z } from "zod";

function readOpenapiYaml(): string {
  if (openapiYamlSource === "__INLINE_OPENAPI_YAML__") {
    throw new Error("openapi.yaml source was not inlined at build time");
  }
  return openapiYamlSource;
}

const healthRoute = createRoute({
  method: "get",
  path: "/api/health.json",
  tags: ["System"],
  summary: "Liveness probe",
  responses: {
    200: {
      description: "Service is alive",
      content: {
        "application/json": {
          schema: z.object({
            ok: z.literal(true),
            checkedAt: z.string(),
          }),
        },
      },
    },
  },
});

const readinessRoute = createRoute({
  method: "get",
  path: "/api/readiness.json",
  tags: ["System"],
  summary: "Readiness probe",
  security: [],
  responses: {
    200: {
      description: "Service is ready",
      content: {
        "application/json": {
          schema: z.object({
            ok: z.literal(true),
            status: z.literal("ready"),
            dependencies: z.object({
              database: z.literal("ok"),
              auth: z.literal("configured"),
              resend: z.enum(["configured", "missing_optional"]),
            }),
          }),
        },
      },
    },
    401: { description: "Missing or invalid READINESS_TOKEN" },
    503: { description: "Service is not ready" },
  },
});

const openapiYamlRoute = createRoute({
  method: "get",
  path: "/api/openapi.yaml",
  tags: ["System"],
  summary: "OpenAPI document (YAML)",
  security: [],
  responses: {
    200: {
      description: "OpenAPI 3.1 document",
      content: {
        "application/yaml": {
          schema: z.string(),
        },
      },
    },
  },
});

const openapiJsonRoute = createRoute({
  method: "get",
  path: "/api/openapi.json",
  tags: ["System"],
  summary: "OpenAPI document (JSON)",
  security: [],
  responses: {
    200: {
      description: "OpenAPI 3.1 document",
      content: {
        "application/json": {
          schema: z.unknown(),
        },
      },
    },
  },
});

function isReadinessAuthorized(
  request: Request,
  env: Record<string, string | undefined>,
): boolean {
  const token = env.READINESS_TOKEN;
  if (!token) return true;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${token}`;
}

export function mountSystemRoutes(app: AppType): void {
  app.openapi(healthRoute, (c) => {
    return c.json({ ok: true, checkedAt: new Date().toISOString() }, 200);
  });

  app.openapi(readinessRoute, async (c) => {
    const env =
      (c.get("runtimeEnv") as Record<string, string | undefined>) ?? {};

    if (!isReadinessAuthorized(c.req.raw, env)) {
      return c.json({ ok: false, status: "unauthorized" as const }, 401);
    }

    const config = getSecretReadiness(env);
    const missing = Object.entries(config)
      .filter(([key, present]) => key !== "resendApiKey" && !present)
      .map(([key]) => key);

    if (missing.length > 0) {
      return c.json(
        { ok: false, status: "configuration_failed" as const, missing },
        503,
      );
    }

    try {
      await checkDatabaseConnection(env);
    } catch {
      return c.json({ ok: false, status: "database_failed" as const }, 503);
    }

    return c.json(
      {
        ok: true,
        status: "ready" as const,
        dependencies: {
          database: "ok" as const,
          auth: "configured" as const,
          resend: config.resendApiKey
            ? ("configured" as const)
            : ("missing_optional" as const),
        },
      },
      200,
    );
  });

  app.openapi(openapiYamlRoute, async (c) => {
    const yaml = await readOpenapiYaml();
    return c.body(yaml, 200, {
      "content-type": "application/yaml; charset=utf-8",
      "cache-control": "public, max-age=60",
    });
  });

  app.openapi(openapiJsonRoute, async (c) => {
    const yaml = await readOpenapiYaml();
    const { default: yamlParse } = await import("js-yaml");
    const json = yamlParse.load(yaml);
    return c.body(JSON.stringify(json), 200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
    });
  });
}
