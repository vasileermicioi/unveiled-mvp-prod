import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { createDb } from "@/db/client";
import * as schema from "@/db/schema";
import { getRuntimeEnv, type RuntimeEnv } from "@/lib/env";

export function createAuth(env?: RuntimeEnv) {
  const runtimeEnv = getRuntimeEnv(env);
  const authDatabaseEnv = { ...runtimeEnv, DATABASE_DRIVER: "neon-http" };

  return betterAuth({
    database: drizzleAdapter(createDb(authDatabaseEnv), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async () => {
        // Email delivery is wired by a later provider-specific change. This keeps
        // the recovery endpoint non-enumerating in development.
      },
    },
    secret: runtimeEnv.BETTER_AUTH_SECRET,
    baseURL:
      runtimeEnv.BETTER_AUTH_URL ??
      runtimeEnv.PUBLIC_BETTER_AUTH_URL ??
      runtimeEnv.PUBLIC_APP_URL,
  });
}

export const auth = createAuth();
