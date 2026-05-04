import type { APIRoute } from "astro";

import { loginWithEmail } from "@/lib/auth-account-actions";
import { readLoginInput } from "@/lib/auth-forms";

export const POST: APIRoute = async ({ request }) => {
  const parsed = await readLoginInput(request);

  if (!parsed.ok) {
    return Response.json({ ok: false, state: parsed.state }, { status: 400 });
  }

  const result = await loginWithEmail(parsed.data);
  const body = result.ok
    ? { ok: true, state: result.state, nextPath: result.nextPath }
    : { ok: false, state: result.state };

  return Response.json(body, {
    status: result.ok ? 200 : result.status,
    headers: result.headers,
  });
};
