import Stripe from "stripe";

import { getPaymentsConfig } from "@/lib/payments/config";

let stripeClient: Stripe | undefined;

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getPaymentsConfig().STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      appInfo: {
        name: "Unveiled",
        version: "0.0.1",
      },
    });
  }

  return stripeClient;
}
