/// <reference types="@cloudflare/workers-types" />

import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";

import { authMiddleware, type AuthInstance } from "@unveiled/api/middleware/auth";
import { corsMiddleware, requestIdMiddleware, runtimeEnvMiddleware } from "@unveiled/api/middleware/cors";
import { errorHandler, jsonErrorMiddleware } from "@unveiled/api/middleware/error";
import type { RuntimeEnv } from "@unveiled/api/env";

import { mountAuthRoutes } from "@unveiled/api/routes/auth";
import { mountSystemRoutes } from "@unveiled/api/routes/system";
import { mountAccountRoutes } from "@unveiled/api/routes/account";
import { mountAdminRoutes } from "@unveiled/api/routes/admin";
import { mountDataAccessRoutes } from "@unveiled/api/routes/data-access";
import { mountStripeRoutes } from "@unveiled/api/routes/stripe";
import { mountActionRoutes } from "@unveiled/api/routes/actions";

export type AppEnv = {
  Variables: {
    runtimeEnv: RuntimeEnv;
    auth: AuthInstance;
    requestId: string;
  };
  Bindings: {
    SESSION?: KVNamespace;
    ASSETS_BUCKET?: R2Bucket;
  };
};

export type AppType = OpenAPIHono<AppEnv>;

export {
  checkDatabaseConnection,
  createDb,
  getDb,
  type Db,
} from "./db/client";
export {
  createAuth,
  auth,
  type AuthInstance,
} from "./middleware/auth";
export {
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConfigError,
  errorEnvelope,
} from "./middleware/error";
export {
  getRuntimeEnv,
  getRequiredEnv,
  getSecretReadiness,
  getCloudflareEnv,
  type RuntimeEnv,
} from "./env";
export {
  AuthAccessError,
  authFailure,
  requireAdmin,
  requireMember,
  requirePartnerForResource,
  requireUser,
  createDefaultUserProfile,
  getViewer,
  toAuthResponse,
  getAuthRedirectPath,
  type Viewer,
  type AuthenticatedViewer,
} from "./auth-profile";
export {
  loadAdminData,
  loadCurrentPartnerData,
  loadMemberData,
  loadPublicDiscoveryData,
} from "./data-access/loaders";
export {
  loginWithEmail,
  logout,
  signUpWithEmail,
  requestPasswordRecovery,
} from "./auth-account-actions";
export {
  uploadAdminAssetFile,
  validateAdminAssetUploadFile,
  type AssetKind,
  type AssetRuntimeEnv,
} from "./assets/storage";
export { getStripe } from "./payments/stripe-client";
export { getPaymentsConfig } from "./payments/config";
export { processStripeEvent } from "./payments/subscriptions";

function buildBaseApp(): AppType {
  const app = new OpenAPIHono<AppEnv>();
  app.use("*", requestIdMiddleware());
  app.use("*", runtimeEnvMiddleware());
  app.use("*", corsMiddleware({ origin: "*" }));
  app.use("*", jsonErrorMiddleware());
  app.use("*", authMiddleware());
  app.onError(errorHandler);
  app.notFound((c) =>
    c.json({ ok: false, code: "not_found", message: "Route not found" }, 404),
  );
  return app;
}

export function createApp(): AppType {
  const app = buildBaseApp();

  mountSystemRoutes(app);
  mountAuthRoutes(app);
  mountAccountRoutes(app);
  mountAdminRoutes(app);
  mountDataAccessRoutes(app);
  mountStripeRoutes(app);
  mountActionRoutes(app);

  return app;
}

export const app = createApp();

export type ServerEnv = {
  SESSION?: KVNamespace;
  ASSETS_BUCKET?: R2Bucket;
  [key: string]: unknown;
};

export default {
  async fetch(
    request: Request,
    env: ServerEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const appWithEnv = app as unknown as Hono<AppEnv>;
    return appWithEnv.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<ServerEnv>;