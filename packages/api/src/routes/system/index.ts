// `openapiYamlSource` is a string literal produced at build time by the
// `inlineOpenApiYamlPlugin` esbuild plugin (see `packages/api/src/openapi.ts`
// and `packages/api/scripts/build.ts`). The plugin replaces the placeholder
// below with the contents of `typespec/output/openapi.yaml` so the Workers
// runtime never touches `node:fs`/`node:path`.
const openapiYamlSource = "__INLINE_OPENAPI_YAML__";

import { createRoute } from "@hono/zod-openapi";

import { checkDatabaseConnection } from "@unveiled/api/db/client";
import { getSecretReadiness } from "@unveiled/api/env";
import {
  getStripeAccountLookup,
  STRIPE_ACCOUNT_CACHE_TTL_MS,
} from "@unveiled/api/payments/stripe-client";
import type { ApiBindings } from "@unveiled/api/env";
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
            trustedOrigins: z.number().int().nonnegative(),
            baseUrl: z.string(),
            authSecret: z.boolean(),
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

type ProbeOk<T extends string = string> = { ok: true; [k: string]: unknown };
type ProbeFail = { ok: false; error: string };
type ProbeResult<T = unknown> = (ProbeOk & T) | ProbeFail;

type ProbeName = "database" | "auth" | "stripe" | "assets";

type ProbeShape = Record<ProbeName, { ok: boolean; [key: string]: unknown }>;

async function probeDatabase(
  env: Record<string, string | undefined>,
): Promise<ProbeResult> {
  try {
    await checkDatabaseConnection(env);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

async function probeAuth(
  env: Record<string, string | undefined>,
): Promise<ProbeResult> {
  const passedSecret = env.BETTER_AUTH_SECRET;
  const passedUrl = env.BETTER_AUTH_URL;
  const secret =
    passedSecret !== undefined ? passedSecret : process.env.BETTER_AUTH_SECRET;
  const url = passedUrl !== undefined ? passedUrl : process.env.BETTER_AUTH_URL;
  if (!secret || !url) {
    return {
      ok: false,
      error: "BETTER_AUTH_SECRET or BETTER_AUTH_URL not set",
    };
  }
  const config = getSecretReadiness(env);
  return {
    ok: true,
    trustedOriginsCount: config.trustedOriginsCount,
    baseUrl: config.baseUrl,
  };
}

async function probeStripe(): Promise<ProbeResult> {
  const result = await getStripeAccountLookup();
  return result;
}

async function probeAssets(
  env: ApiBindings & Record<string, unknown>,
): Promise<ProbeResult> {
  const bucket = env.ASSETS_BUCKET as R2Bucket | undefined;
  if (!bucket) {
    return { ok: false, error: "ASSETS_BUCKET binding missing" };
  }
  try {
    const head = await bucket.head("");
    return { ok: true, hasBucket: head !== null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

async function runProbes(
  env: Record<string, string | undefined> & ApiBindings,
): Promise<{ shape: ProbeShape; failing: ProbeName[] }> {
  const shape: ProbeShape = {
    database: { ok: false },
    auth: { ok: false },
    stripe: { ok: false },
    assets: { ok: false },
  };
  const failing: ProbeName[] = [];

  const database = await probeDatabase(env);
  shape.database = database;
  if (!database.ok) failing.push("database");

  const auth = await probeAuth(env);
  shape.auth = auth;
  if (!auth.ok) failing.push("auth");

  const stripe = await probeStripe();
  shape.stripe = { ...stripe, cacheTtlMs: STRIPE_ACCOUNT_CACHE_TTL_MS };
  if (!stripe.ok) failing.push("stripe");

  const assets = await probeAssets(env);
  shape.assets = assets;
  if (!assets.ok) failing.push("assets");

  return { shape, failing };
}

export { probeDatabase, probeAuth, probeStripe, probeAssets, runProbes };

function isV2Enabled(env: Record<string, string | undefined>): boolean {
  return env.READINESS_PROBE_V2 === "1" || env.READINESS_PROBE_V2 === "true";
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

    if (isV2Enabled(env)) {
      const { shape, failing } = await runProbes(env);
      if (failing.length > 0) {
        return c.json(
          {
            ok: false,
            status: "not_ready" as const,
            failing,
            probes: shape,
          },
          503,
        );
      }
      return c.json(
        {
          ok: true,
          status: "ready" as const,
          probes: shape,
        },
        200,
      );
    }

    const config = getSecretReadiness(env);
    const missing = Object.entries(config)
      .filter(
        ([key, present]) =>
          key !== "resendApiKey" &&
          key !== "trustedOrigins" &&
          key !== "baseUrl" &&
          !present,
      )
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
        trustedOrigins: config.trustedOrigins,
        baseUrl: config.baseUrl,
        authSecret: config.authSecret,
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
