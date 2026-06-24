import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { StripeCheckoutRedirectButtonPresentational } from "../../organisms/payments/stripe-checkout-redirect-button/stripe-checkout-redirect-button";
import { makeMockStripeCheckoutRedirectButtonProps } from "../../organisms/payments/stripe-checkout-redirect-button/stripe-checkout-redirect-button.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Checkout
        </h1>
      ),
      pageBody: (
        <StripeCheckoutRedirectButtonPresentational
          {...makeMockStripeCheckoutRedirectButtonProps()}
        />
      ),
    })}
  />
);

export default {
  title: "Pages / Payments / Stripe checkout",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
