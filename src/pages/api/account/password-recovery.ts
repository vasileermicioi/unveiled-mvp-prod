import { env as cloudflareEnv } from "cloudflare:workers";
import type { APIRoute } from "astro";

import { requestPasswordRecovery } from "@/lib/auth-account-actions";
import { readPasswordRecoveryInput } from "@/lib/auth-forms";
import { getCloudflareEnv } from "@/lib/env";

export const POST: APIRoute = async ({ locals, request }) => {
  const parsed = await readPasswordRecoveryInput(request);

  if (!parsed.ok) {
    return Response.json({ ok: false, state: parsed.state }, { status: 400 });
  }

  const result = await requestPasswordRecovery(parsed.data, {
    ...getCloudflareEnv(locals),
    ...(cloudflareEnv as Record<string, string | undefined>),
  });

  return Response.json(
    { ok: true, state: result.state },
    {
      status: 200,
      headers: result.headers,
    },
  );
};
