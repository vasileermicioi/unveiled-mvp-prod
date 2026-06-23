import { getRuntimeEnv } from "@unveiled/api/env";
import type { Context, MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

export type CorsOptions = {
  origin?: string | string[];
};

export function corsMiddleware(options: CorsOptions = {}): MiddlewareHandler {
  const origin = options.origin ?? "*";
  return cors({
    origin,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
    credentials: true,
  });
}

export function runtimeEnvMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const cloudflareEnv = (c.env ?? {}) as Record<string, unknown>;
    const runtimeEnv = getRuntimeEnv(
      cloudflareEnv as Record<string, string | undefined>,
    );
    c.set("runtimeEnv", runtimeEnv);
    await next();
  };
}

export function requestIdMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const headerId = c.req.header("x-request-id");
    const id = headerId ?? crypto.randomUUID();
    c.set("requestId", id);
    c.header("x-request-id", id);
    await next();
  };
}

export type AppContext = Context & {
  set: <K extends string, V>(key: K, value: V) => void;
  get: <K extends string, V>(key: K) => V;
};
