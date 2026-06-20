import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { MiddlewareHandler } from "hono";

import { createDb } from "@unveiled/api/db/client";
import * as schema from "@unveiled/api/db/schema";
import { getRuntimeEnv, type RuntimeEnv } from "@unveiled/api/env";

export type AuthInstance = ReturnType<typeof betterAuth>;

export type SessionContext = {
  user?: { id: string; email?: string; name?: string };
  session?: { id: string; userId: string; expiresAt: Date };
};

export function createAuth(env?: RuntimeEnv): AuthInstance {
  const runtimeEnv = getRuntimeEnv(env);
  const authDatabaseEnv = {
    ...runtimeEnv,
    DATABASE_DRIVER: "neon-http" as const,
  };

  return betterAuth({
    database: drizzleAdapter(createDb(authDatabaseEnv), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async () => {
        // Email delivery is wired by a later provider-specific change.
      },
    },
    secret: runtimeEnv.BETTER_AUTH_SECRET,
    baseURL:
      runtimeEnv.BETTER_AUTH_URL ??
      runtimeEnv.PUBLIC_BETTER_AUTH_URL ??
      runtimeEnv.PUBLIC_APP_URL,
    advanced: runtimeEnv.AUTH_COOKIE_DOMAIN
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: runtimeEnv.AUTH_COOKIE_DOMAIN,
          },
        }
      : {},
  } as Parameters<typeof betterAuth>[0]) as AuthInstance;
}

export const auth = createAuth();

export function authMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const runtimeEnv = (c.get("runtimeEnv") as RuntimeEnv | undefined) ?? {};
    const auth = createAuth(runtimeEnv);
    c.set("auth", auth);
    await next();
  };
}

export type AuthVariables = {
  auth: AuthInstance;
  runtimeEnv: RuntimeEnv;
};
