#!/usr/bin/env bun

/**
 * Dev runner for the orchestrator Worker.
 *
 * Boots a Bun HTTP server on port 4320 that runs the production
 * `worker.ts` against a synthesized env whose service bindings are
 * replaced with plain `fetch()` proxies to the three local dev servers:
 *
 *   - `env.API`     -> http://localhost:8787
 *   - `env.APP`     -> http://localhost:4321
 *   - `env.LANDING` -> http://localhost:4322
 *
 * The Worker code is imported directly from `src/worker.ts` so dev
 * and production share the same dispatch, logging, and security
 * header logic.
 */

import { env as loadEnv } from "node:process";
import worker, { type OrchestratorEnv } from "./worker";

const PORT = Number.parseInt(loadEnv.ORCHESTRATOR_PORT ?? "4320", 10);
const HOST = loadEnv.ORCHESTRATOR_HOST ?? "127.0.0.1";

const DOWNSTREAM = {
  API: loadEnv.API_UPSTREAM ?? "http://localhost:8787",
  APP: loadEnv.APP_UPSTREAM ?? "http://localhost:4321",
  LANDING: loadEnv.LANDING_UPSTREAM ?? "http://localhost:4322",
} as const;

function buildLocalFetcher(upstream: string, prefix: string): Fetcher {
  return {
    async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
      const request =
        input instanceof Request ? input : new Request(input, init);
      const incomingUrl = new URL(request.url);
      const downstreamPath = incomingUrl.pathname.startsWith(prefix)
        ? incomingUrl.pathname
        : `${prefix}${incomingUrl.pathname}`;
      const target = `${upstream}${downstreamPath}${incomingUrl.search}`;
      try {
        return await fetch(target, request);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.error(
          `[orchestrator-dev] upstream ${upstream} error: ${reason}`,
        );
        return new Response(
          `Bad Gateway: upstream ${upstream} returned ${reason}`,
          {
            status: 502,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          },
        );
      }
    },
    connect() {
      throw new Error("local dev fetcher does not accept TCP connections");
    },
  } as unknown as Fetcher;
}

const localEnv: OrchestratorEnv = {
  ...(DOWNSTREAM.API ? { API: buildLocalFetcher(DOWNSTREAM.API, "/api") } : {}),
  ...(DOWNSTREAM.APP ? { APP: buildLocalFetcher(DOWNSTREAM.APP, "/app") } : {}),
  ...(DOWNSTREAM.LANDING
    ? { LANDING: buildLocalFetcher(DOWNSTREAM.LANDING, "/") }
    : {}),
};

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  development: true,
  async fetch(request: Request): Promise<Response> {
    try {
      return await worker.fetch(request, localEnv, {
        waitUntil() {},
        passThroughOnException() {},
        async abort() {},
      } as unknown as ExecutionContext);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(
        `[orchestrator-dev] ${request.method} ${new URL(request.url).pathname}: ${reason}`,
      );
      return new Response(`Bad Gateway: ${reason}`, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  },
  error(error: Error): Response {
    console.error("[orchestrator-dev] server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(
  `[orchestrator-dev] listening on http://${server.hostname}:${server.port}`,
);
console.log(
  `[orchestrator-dev] downstream: api=${DOWNSTREAM.API} app=${DOWNSTREAM.APP} landing=${DOWNSTREAM.LANDING}`,
);

const shutdown = (signal: string) => {
  console.log(`[orchestrator-dev] received ${signal}, shutting down`);
  server.stop();
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
