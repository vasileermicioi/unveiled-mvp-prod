export * from "./admin-freeze-unfreeze-form";
export * from "./credit-ledger-table";
export * from "./stripe-checkout-redirect-button";
export * from "./subscription-portal-link";

import * as AdminFreezeUnfreezeForm from "./admin-freeze-unfreeze-form";
import * as CreditLedgerTable from "./credit-ledger-table";
import * as StripeCheckoutRedirectButton from "./stripe-checkout-redirect-button";
import * as SubscriptionPortalLink from "./subscription-portal-link";

export const Payments = {
  ...AdminFreezeUnfreezeForm,
  ...CreditLedgerTable,
  ...StripeCheckoutRedirectButton,
  ...SubscriptionPortalLink,
} as const;
