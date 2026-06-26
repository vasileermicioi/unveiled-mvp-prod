import { getPaymentsConfig } from "@unveiled/api/payments/config";
import Stripe from "stripe";

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

type CachedAccountLookup = {
  result: { ok: true; accountId: string } | { ok: false; error: string };
  at: number;
};

const ACCOUNT_CACHE_TTL_MS = 60_000;
const accountLookupCache = new Map<string, CachedAccountLookup>();

export function clearStripeAccountLookupCache(): void {
  accountLookupCache.clear();
}

export async function getStripeAccountLookup(
  cacheKey = "default",
): Promise<{ ok: true; accountId: string } | { ok: false; error: string }> {
  const now = Date.now();
  const cached = accountLookupCache.get(cacheKey);
  if (cached && now - cached.at < ACCOUNT_CACHE_TTL_MS) {
    return cached.result;
  }

  const stripe = getStripe();
  try {
    const account = await stripe.accounts.retrieve();
    const result = {
      ok: true as const,
      accountId: account.id,
    };
    accountLookupCache.set(cacheKey, { result, at: now });
    return result;
  } catch (err) {
    const result = {
      ok: false as const,
      error: err instanceof Error ? err.message : "unknown",
    };
    accountLookupCache.set(cacheKey, { result, at: now });
    return result;
  }
}

export const STRIPE_ACCOUNT_CACHE_TTL_MS = ACCOUNT_CACHE_TTL_MS;
