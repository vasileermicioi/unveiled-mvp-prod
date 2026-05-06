import { env as cloudflareEnv } from "cloudflare:workers";
import type { APIRoute } from "astro";

import { createAuth } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/env";

export const ALL: APIRoute = async ({ locals, request }) =>
  createAuth({
    ...getCloudflareEnv(locals),
    ...(cloudflareEnv as Record<string, string | undefined>),
  }).handler(request);
