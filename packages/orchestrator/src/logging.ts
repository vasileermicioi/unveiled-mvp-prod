import { ORCHESTRATOR_SECURITY_HEADERS } from "./index";

const REDACTED = "[REDACTED]";

const SENSITIVE_HEADER_NAMES = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "stripe-signature",
  "x-api-key",
  "x-auth-token",
]);

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function cloneHeaders(
  source: Headers,
  extras: Record<string, string> = {},
): Headers {
  const next = new Headers(source);
  for (const [name, value] of Object.entries(extras)) {
    next.set(name, value);
  }
  return next;
}

function applySecurityHeaders(
  response: Response,
  requestPath: string,
): Response {
  if (isApiPath(requestPath)) {
    return response;
  }
  const next = new Headers(response.headers);
  for (const [name, value] of Object.entries(ORCHESTRATOR_SECURITY_HEADERS)) {
    next.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: next,
  });
}

function withRequestId(request: Request, requestId: string): Request {
  const headers = cloneHeaders(request.headers, { "x-request-id": requestId });
  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    redirect: request.redirect,
    integrity: request.integrity,
    keepalive: request.keepalive,
    signal: request.signal,
    credentials: request.credentials,
    mode: request.mode,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    cache: request.cache,
  });
}

function logRequest(input: {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
}): void {
  const line = {
    timestamp: new Date().toISOString(),
    level: "info",
    message: "orchestrator.request",
    service: "unveiled-orchestrator",
    env: "local",
    requestId: input.requestId,
    method: input.method,
    path: input.path,
    status: input.status,
    durationMs: input.durationMs,
  };
  console.log(JSON.stringify(line));
}

function logError(input: {
  requestId: string;
  method: string;
  path: string;
  durationMs: number;
  error: unknown;
}): void {
  const reason =
    input.error instanceof Error ? input.error.message : String(input.error);
  const line = {
    timestamp: new Date().toISOString(),
    level: "error",
    message: "orchestrator.error",
    service: "unveiled-orchestrator",
    env: "local",
    requestId: input.requestId,
    method: input.method,
    path: input.path,
    durationMs: input.durationMs,
    error: reason,
  };
  console.log(JSON.stringify(line));
}

export function withSecurityHeaders(
  response: Response,
  requestPath: string,
): Response {
  return applySecurityHeaders(response, requestPath);
}

export function requestIdFor(request: Request): string {
  const incoming = request.headers.get("x-request-id");
  if (incoming && incoming.length > 0 && incoming.length <= 128)
    return incoming;
  return crypto.randomUUID();
}

export function withRequestIdHeader(
  request: Request,
  requestId: string,
): Request {
  return withRequestId(request, requestId);
}

export { logError, logRequest, REDACTED, SENSITIVE_HEADER_NAMES };
