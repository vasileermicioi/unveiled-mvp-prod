import type { IncomingMessage, ServerResponse } from "node:http";
import { request as httpRequest } from "node:http";
import type { Duplex } from "node:stream";
import type { Plugin, ViteDevServer } from "vite";
import { normalizeAppPath } from "./index";

const API_UPSTREAM = process.env.API_UPSTREAM ?? "http://localhost:8787";
const APP_UPSTREAM = process.env.APP_UPSTREAM ?? "http://localhost:4321";
const LANDING_UPSTREAM =
  process.env.LANDING_UPSTREAM ?? "http://localhost:4322";

function targetForPath(pathname: string): string | null {
  if (pathname.startsWith("/api/") || pathname === "/api") return API_UPSTREAM;
  if (pathname.startsWith("/app/") || pathname === "/app") return APP_UPSTREAM;
  if (
    pathname.startsWith("/@vite/") ||
    pathname.startsWith("/@id/") ||
    pathname.startsWith("/@fs/") ||
    pathname.startsWith("/node_modules/") ||
    pathname.startsWith("/src/") ||
    pathname === "/__vite_ping"
  ) {
    return APP_UPSTREAM;
  }
  return LANDING_UPSTREAM;
}

function proxyHttp(
  upstream: string,
  req: IncomingMessage,
  res: ServerResponse,
): void {
  const target = new URL(upstream);
  const proxyReq = httpRequest(
    {
      hostname: target.hostname,
      port: target.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: target.host },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end(`Bad Gateway: ${err.message}`);
  });
  req.pipe(proxyReq);
}

function proxyWs(upstream: string, req: IncomingMessage, socket: Duplex): void {
  const target = new URL(upstream);
  const proxyReq = httpRequest({
    hostname: target.hostname,
    port: target.port,
    path: req.url,
    method: "GET",
    headers: { ...req.headers, host: target.host },
  });
  proxyReq.on("upgrade", (_proxyRes, proxySocket, proxyHead) => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        Object.entries(_proxyRes.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\r\n") +
        "\r\n\r\n",
    );
    if (proxyHead.length > 0) proxySocket.unshift(proxyHead);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxyReq.on("error", () => {
    socket.destroy();
  });
  proxyReq.end();
}

export function dispatchPlugin(): Plugin {
  return {
    name: "unveiled-orchestrator-dispatch",
    configureServer(server: ViteDevServer) {
      const app = server.middlewares;

      app.use((req, res, next) => {
        const rawUrl = req.url ?? "/";
        const pathname = rawUrl.split("?")[0] ?? "/";

        if (pathname === "/healthz") {
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("ok");
          return;
        }
        if (pathname === "/readyz") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "ok",
              surfaces: { api: "dev", app: "dev", landing: "dev" },
            }),
          );
          return;
        }

        const acceptLanguage = req.headers["accept-language"];
        const cookie = req.headers["cookie"];
        const proxyHeaders: Record<string, string> = {};
        if (acceptLanguage)
          proxyHeaders["accept-language"] = String(acceptLanguage);
        if (cookie) proxyHeaders["cookie"] = String(cookie);
        const fakeRequest = new Request(`http://localhost${rawUrl}`, {
          headers: proxyHeaders,
        });
        const normalized = normalizeAppPath(pathname, fakeRequest);
        if (normalized) {
          res.writeHead(302, { Location: normalized });
          res.end();
          return;
        }

        const target = targetForPath(pathname);
        if (target) {
          proxyHttp(target, req, res);
          return;
        }
        next();
      });

      server.httpServer?.on("upgrade", (req, socket, _head) => {
        const pathname = (req.url ?? "/").split("?")[0] ?? "/";
        const target = targetForPath(pathname);
        if (target) {
          proxyWs(target, req, socket as Duplex);
        } else {
          socket.destroy();
        }
      });
    },
  };
}
