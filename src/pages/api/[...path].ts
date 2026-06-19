/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from "astro";

const API_WORKER_URL =
  process.env.API_WORKER_URL ?? process.env.PUBLIC_API_WORKER_URL ?? "";

export const ALL: APIRoute = async ({ request }) => {
  if (!API_WORKER_URL) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "api_worker_unconfigured",
        message:
          "Set API_WORKER_URL (or PUBLIC_API_WORKER_URL) so the Astro app can forward /api/* to the @unveiled/api worker.",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const url = new URL(request.url);
  const target = `${API_WORKER_URL.replace(/\/$/, "")}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.host);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  return fetch(target, init);
};