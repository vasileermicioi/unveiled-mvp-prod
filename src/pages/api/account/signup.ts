import type { APIRoute } from "astro";

import { signUpWithEmail } from "@/lib/auth-account-actions";
import { readSignupInput } from "@/lib/auth-forms";

export const POST: APIRoute = async ({ request }) => {
  const parsed = await readSignupInput(request);

  if (!parsed.ok) {
    return Response.json({ ok: false, state: parsed.state }, { status: 400 });
  }

  const result = await signUpWithEmail(parsed.data);
  const body = result.ok
    ? { ok: true, state: result.state, nextPath: result.nextPath }
    : { ok: false, state: result.state };

  return Response.json(body, {
    status: result.ok ? 200 : result.status,
    headers: result.headers,
  });
};
