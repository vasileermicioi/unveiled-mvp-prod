type RuntimeEnvValue = string | undefined;

export type RuntimeEnv = Record<string, RuntimeEnvValue>;

type RuntimeContainer = {
  env?: RuntimeEnv;
  runtime?: {
    env?: RuntimeEnv;
  };
};

export function getCloudflareEnv(locals?: unknown): RuntimeEnv {
  const container = locals as RuntimeContainer | undefined;
  return container?.env ?? {};
}

export function getRuntimeEnv(env: RuntimeEnv = {}): RuntimeEnv {
  const runtimeEnv = {
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

export function getPublicConfig(env: RuntimeEnv = {}) {
  const runtimeEnv = getRuntimeEnv(env);
  return {
    PUBLIC_APP_URL: runtimeEnv.PUBLIC_APP_URL,
    PUBLIC_BETTER_AUTH_URL: runtimeEnv.PUBLIC_BETTER_AUTH_URL,
  };
}

export function getSecretReadiness(env: RuntimeEnv = {}) {
  const runtimeEnv = getRuntimeEnv(env);
  return {
    authSecret: Boolean(runtimeEnv.BETTER_AUTH_SECRET),
    authUrl: Boolean(runtimeEnv.BETTER_AUTH_URL),
    databaseUrl: Boolean(runtimeEnv.DATABASE_URL),
    resendApiKey: Boolean(runtimeEnv.RESEND_API_KEY),
    assetBaseUrl: Boolean(runtimeEnv.PUBLIC_ASSET_BASE_URL),
  };
}
