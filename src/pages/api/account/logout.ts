import { env as cloudflareEnv } from "cloudflare:workers";
import type { APIRoute } from "astro";

import { logout } from "@/lib/auth-account-actions";
import { getCloudflareEnv } from "@/lib/env";

export const POST: APIRoute = async ({ locals, request }) => {
  const result = await logout(request.headers, {
    ...getCloudflareEnv(locals),
    ...(cloudflareEnv as Record<string, string | undefined>),
  });
  const body = result.ok
    ? { ok: true, state: result.state, nextPath: result.nextPath }
    : { ok: false, state: result.state };

  return Response.json(body, {
    status: result.ok ? 200 : result.status,
    headers: result.headers,
  });
};
