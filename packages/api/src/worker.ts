/// <reference types="@cloudflare/workers-types" />

import { OpenAPIHono } from "@hono/zod-openapi";
import type { RuntimeEnv } from "@unveiled/api/env";

import {
  type AuthInstance,
  authMiddleware,
} from "@unveiled/api/middleware/auth";
import {
  corsMiddleware,
  requestIdMiddleware,
  runtimeEnvMiddleware,
} from "@unveiled/api/middleware/cors";
import {
  errorHandler,
  jsonErrorMiddleware,
} from "@unveiled/api/middleware/error";
import { mountAccountRoutes } from "@unveiled/api/routes/account";
import { mountActionRoutes } from "@unveiled/api/routes/actions";
import { mountAdminRoutes } from "@unveiled/api/routes/admin";
import { mountAuthRoutes } from "@unveiled/api/routes/auth";
import { mountDataAccessRoutes } from "@unveiled/api/routes/data-access";
import { mountStripeRoutes } from "@unveiled/api/routes/stripe";
import { mountSystemRoutes } from "@unveiled/api/routes/system";
import type { Hono } from "hono";

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
  type AssetKind,
  type AssetRuntimeEnv,
  uploadAdminAssetFile,
  validateAdminAssetUploadFile,
} from "./assets/storage";
export {
  loginWithEmail,
  logout,
  requestPasswordRecovery,
  signUpWithEmail,
} from "./auth-account-actions";
export {
  AuthAccessError,
  type AuthenticatedViewer,
  authFailure,
  createDefaultUserProfile,
  getAuthRedirectPath,
  getViewer,
  requireAdmin,
  requireMember,
  requirePartnerForResource,
  requireUser,
  toAuthResponse,
  type Viewer,
} from "./auth-profile";
export {
  loadAdminData,
  loadCurrentPartnerData,
  loadMemberData,
  loadPublicDiscoveryData,
} from "./data-access/loaders";
export {
  checkDatabaseConnection,
  createDb,
  type Db,
  getDb,
} from "./db/client";
export {
  getCloudflareEnv,
  getRequiredEnv,
  getRuntimeEnv,
  getSecretReadiness,
  type RuntimeEnv,
} from "./env";
export {
  type AuthInstance,
  auth,
  createAuth,
} from "./middleware/auth";
export {
  AuthError,
  ConfigError,
  errorEnvelope,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "./middleware/error";
export { getPaymentsConfig } from "./payments/config";
export { getStripe } from "./payments/stripe-client";
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
