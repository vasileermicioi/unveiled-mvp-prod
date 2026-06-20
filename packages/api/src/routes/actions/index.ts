import type { AppType } from "@unveiled/api/worker";

const FORWARD_HEADER = "x-action-forward";

function isActionRoute(path: string): boolean {
  return path.startsWith("/api/actions/");
}

export function mountActionRoutes(app: AppType): void {
  app.use("/api/actions/*", async (c) => {
    const incoming = c.req.raw;
    const path = new URL(incoming.url).pathname.replace(
      /^\/api\/actions\//,
      "",
    );
    const actionPath = `/_actions/${path}`;
    const requestHeaders = new Headers(incoming.headers);
    requestHeaders.set(FORWARD_HEADER, "1");

    const forwarded = new Request(new URL(actionPath, incoming.url), {
      method: incoming.method,
      headers: requestHeaders,
      body:
        incoming.method === "GET" || incoming.method === "HEAD"
          ? undefined
          : await incoming.clone().arrayBuffer(),
    });

    const origin = new URL(actionPath, incoming.url).origin;
    const response = await fetch(forwarded);

    if (!response.ok && response.status >= 500) {
      console.error("[api] action forward failed", actionPath, response.status);
    }

    void origin;
    return response;
  });
}

export { isActionRoute };
