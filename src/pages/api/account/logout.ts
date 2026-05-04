import type { APIRoute } from "astro";

import { logout } from "@/lib/auth-account-actions";

export const POST: APIRoute = async ({ request }) => {
  const result = await logout(request.headers);
  const body = result.ok
    ? { ok: true, state: result.state, nextPath: result.nextPath }
    : { ok: false, state: result.state };

  return Response.json(body, {
    status: result.ok ? 200 : result.status,
    headers: result.headers,
  });
};
