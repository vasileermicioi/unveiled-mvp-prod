import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { OpenAPIHono } from "@hono/zod-openapi";

import { mountAccountRoutes } from "./routes/account";
import { mountActionRoutes } from "./routes/actions";
import { mountAdminRoutes } from "./routes/admin";
import { mountAuthRoutes } from "./routes/auth";
import { mountDataAccessRoutes } from "./routes/data-access";
import { mountStripeRoutes } from "./routes/stripe";
import { mountSystemRoutes } from "./routes/system";
import { authMiddleware } from "./middleware/auth";
import {
  corsMiddleware,
  requestIdMiddleware,
  runtimeEnvMiddleware,
} from "./middleware/cors";
import { errorHandler, jsonErrorMiddleware } from "./middleware/error";

export function buildDocument(): unknown {
  const app = new OpenAPIHono();
  app.use("*", requestIdMiddleware());
  app.use("*", runtimeEnvMiddleware());
  app.use("*", corsMiddleware({ origin: "*" }));
  app.use("*", jsonErrorMiddleware());
  app.use("*", authMiddleware());
  app.onError(errorHandler);

  mountSystemRoutes(app as unknown as Parameters<typeof mountSystemRoutes>[0]);
  mountAccountRoutes(
    app as unknown as Parameters<typeof mountAccountRoutes>[0],
  );
  mountAdminRoutes(app as unknown as Parameters<typeof mountAdminRoutes>[0]);
  mountDataAccessRoutes(
    app as unknown as Parameters<typeof mountDataAccessRoutes>[0],
  );
  mountStripeRoutes(app as unknown as Parameters<typeof mountStripeRoutes>[0]);

  return app.getOpenAPIDocument({
    openapi: "3.1.0",
    info: {
      title: "Unveiled API",
      version: "0.0.0",
      description:
        "Generated from the Hono app at build time; canonical contract is the TypeSpec source.",
    },
    servers: [{ url: "/" }],
  });
}

void readFileSync;
void resolve;
