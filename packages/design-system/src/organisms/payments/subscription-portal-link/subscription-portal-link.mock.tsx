import type { SubscriptionPortalLinkProps } from "./subscription-portal-link";

export function makeMockSubscriptionPortalLinkProps(
  overrides: Partial<SubscriptionPortalLinkProps> = {},
): SubscriptionPortalLinkProps {
  return {
    active: true,
    url: "https://billing.stripe.com/p/session/test_123",
    linkLabel: "Manage subscription",
    linkHint: "Opens Stripe customer portal",
    missingFallback: "Portal link unavailable right now.",
    landmarkLabel: "Subscription portal",
    ...overrides,
  };
}
