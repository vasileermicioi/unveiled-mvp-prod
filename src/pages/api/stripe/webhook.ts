import type { APIRoute } from "astro";
import type Stripe from "stripe";

import { StripeEventSchema } from "@/lib/generated/request-validators";
import { getPaymentsConfig } from "@/lib/payments/config";
import { getStripe } from "@/lib/payments/stripe-client";
import { processStripeEvent } from "@/lib/payments/subscriptions";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getPaymentsConfig().STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  const parsed = StripeEventSchema.safeParse(event);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Stripe payload does not match the generated contract.",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  await processStripeEvent(event);

  return Response.json({ received: true });
};
