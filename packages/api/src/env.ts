export /// <reference types="@cloudflare/workers-types" />

type RuntimeEnvValue = string | undefined;

export type RuntimeEnv = Record<string, RuntimeEnvValue>;

export type ApiEnv = RuntimeEnv & {
  DATABASE_URL?: string;
  DATABASE_DRIVER?: "neon-http" | "neon-serverless";
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
  PUBLIC_BETTER_AUTH_URL?: string;
  PUBLIC_APP_URL?: string;
  PUBLIC_ORCHESTRATOR_URL?: string;
  AUTH_COOKIE_DOMAIN?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  READINESS_TOKEN?: string;
  PARITY_TEST_MODE?: string;
  PARITY_TEST_DATABASE_URL?: string;
};

export type ApiBindings = {
  SESSION?: KVNamespace;
  ASSETS_BUCKET?: R2Bucket;
};

export function getRuntimeEnv(env: RuntimeEnv = {}): RuntimeEnv {
  const runtimeEnv: RuntimeEnv = {
    ...process.env,
    ...env,
  };

  if (
    runtimeEnv.PARITY_TEST_MODE === "1" &&
    runtimeEnv.PARITY_TEST_DATABASE_URL
  ) {
    runtimeEnv.DATABASE_URL = runtimeEnv.PARITY_TEST_DATABASE_URL;
  }

  return runtimeEnv;
}

export function getRequiredEnv(key: string, env: RuntimeEnv = {}): string {
  const value = getRuntimeEnv(env)[key];
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
}

const DEV_TRUSTED_ORIGINS = [
  "http://localhost:4320",
  "http://127.0.0.1:4320",
  "http://localhost:8787",
] as const;

const DEV_BASE_URL = "http://localhost:4320";

export function resolveTrustedOrigins(runtimeEnv: RuntimeEnv): string[] {
  const sources: (string | undefined)[] = [
    runtimeEnv.BETTER_AUTH_TRUSTED_ORIGINS,
  ];

  if (runtimeEnv.PUBLIC_APP_URL) {
    sources.push(runtimeEnv.PUBLIC_APP_URL);
  }
  if (runtimeEnv.PUBLIC_ORCHESTRATOR_URL) {
    sources.push(runtimeEnv.PUBLIC_ORCHESTRATOR_URL);
  }

  const combined: string[] = [];
  for (const source of sources) {
    if (!source) continue;
    for (const part of source.split(",")) {
      const trimmed = part.trim();
      if (trimmed) combined.push(trimmed);
    }
  }

  for (const origin of DEV_TRUSTED_ORIGINS) {
    combined.push(origin);
  }

  return Array.from(new Set(combined));
}

export function resolveBaseURL(runtimeEnv: RuntimeEnv): string {
  return (
    runtimeEnv.BETTER_AUTH_URL ??
    runtimeEnv.PUBLIC_BETTER_AUTH_URL ??
    runtimeEnv.PUBLIC_ORCHESTRATOR_URL ??
    DEV_BASE_URL
  );
}

export function getSecretReadiness(env: RuntimeEnv = {}) {
  const runtimeEnv = getRuntimeEnv(env);
  return {
    authSecret: Boolean(runtimeEnv.BETTER_AUTH_SECRET),
    authUrl: Boolean(runtimeEnv.BETTER_AUTH_URL),
    databaseUrl: Boolean(runtimeEnv.DATABASE_URL),
    resendApiKey: Boolean(runtimeEnv.RESEND_API_KEY),
    assetBaseUrl: Boolean(runtimeEnv.PUBLIC_ASSET_BASE_URL),
    trustedOrigins: resolveTrustedOrigins(runtimeEnv).length,
    baseUrl: resolveBaseURL(runtimeEnv),
  };
}

export function getCloudflareEnv(input?: unknown): RuntimeEnv {
  if (!input || typeof input !== "object") return {};
  const container = input as { env?: RuntimeEnv };
  return container.env ?? {};
}
