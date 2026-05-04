import type { APIRoute } from "astro";

import { requestPasswordRecovery } from "@/lib/auth-account-actions";
import { readPasswordRecoveryInput } from "@/lib/auth-forms";

export const POST: APIRoute = async ({ request }) => {
  const parsed = await readPasswordRecoveryInput(request);

  if (!parsed.ok) {
    return Response.json({ ok: false, state: parsed.state }, { status: 400 });
  }

  const result = await requestPasswordRecovery(parsed.data);

  return Response.json(
    { ok: true, state: result.state },
    {
      status: 200,
      headers: result.headers,
    },
  );
};
