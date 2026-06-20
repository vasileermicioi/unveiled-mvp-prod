import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import {
  getPaymentsConfig,
  getStripe,
  processStripeEvent,
} from "@unveiled/api/payments";
import type { AppType } from "@unveiled/api/worker";
import { StripeEventSchema } from "@unveiled/api/generated-bundled";

const webhookResponseSchema = z.union([
  z.object({ received: z.literal(true) }),
  z.object({ error: z.string() }),
  z.object({
    error: z.literal("Stripe payload does not match the generated contract."),
    issues: z.array(z.unknown()),
  }),
]);

const webhookRoute = createRoute({
  method: "post",
  path: "/api/stripe/webhook",
  tags: ["Stripe"],
  summary: "Stripe webhook receiver",
  security: [],
  request: {
    body: {
      content: {
        "application/json": { schema: z.unknown() },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook accepted",
      content: { "application/json": { schema: webhookResponseSchema } },
    },
    400: {
      description: "Signature missing or invalid",
      content: { "application/json": { schema: webhookResponseSchema } },
    },
    422: {
      description: "Payload did not match the generated contract",
      content: { "application/json": { schema: webhookResponseSchema } },
    },
  },
});

export function mountStripeRoutes(app: AppType): void {
  app.openapi(webhookRoute, async (c) => {
    const signature = c.req.header("stripe-signature");
    if (!signature) {
      return c.json({ error: "Missing Stripe signature." }, 400);
    }

    const rawBody = await c.req.raw.text();
    let event: import("stripe").Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        getPaymentsConfig().STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      return c.json({ error: "Invalid Stripe signature." }, 400);
    }

    const parsed = StripeEventSchema.safeParse(event);
    if (!parsed.success) {
      return c.json(
        {
          error: "Stripe payload does not match the generated contract.",
          issues: parsed.error.issues,
        },
        422,
      );
    }

    await processStripeEvent(event);
    return c.json({ received: true }, 200);
  });
}
