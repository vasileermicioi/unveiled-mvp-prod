import { StripeCheckoutRedirectButtonPresentational } from "./stripe-checkout-redirect-button";
import { makeMockStripeCheckoutRedirectButtonProps } from "./stripe-checkout-redirect-button.mock";

export const Default = () => (
  <StripeCheckoutRedirectButtonPresentational
    {...makeMockStripeCheckoutRedirectButtonProps()}
  />
);

export const MethodSelected = () => (
  <StripeCheckoutRedirectButtonPresentational
    {...makeMockStripeCheckoutRedirectButtonProps({
      selectedPaymentMethod: "PAYPAL",
    })}
  />
);

export const WithPromo = () => (
  <StripeCheckoutRedirectButtonPresentational
    {...makeMockStripeCheckoutRedirectButtonProps({
      selectedPaymentMethod: "CARD",
      promoCode: "UNVEILED-FRIENDS",
    })}
  />
);

export const Submitting = () => (
  <StripeCheckoutRedirectButtonPresentational
    {...makeMockStripeCheckoutRedirectButtonProps({
      selectedPaymentMethod: "CARD",
      busy: true,
    })}
  />
);

export const WithMessage = () => (
  <StripeCheckoutRedirectButtonPresentational
    {...makeMockStripeCheckoutRedirectButtonProps({
      selectedPaymentMethod: "CARD",
      message: "Continue with checkout to complete your booking.",
    })}
  />
);

export default {
  title: "Organisms / Payments / Stripe Checkout Redirect Button",
  parameters: { ladle: { skipCoverage: true } },
};
