import type {
  StripeCheckoutPaymentMethodOption,
  StripeCheckoutRedirectButtonCopy,
  StripeCheckoutRedirectButtonProps,
} from "./stripe-checkout-redirect-button";

export function makeMockStripeCheckoutRedirectButtonProps(
  overrides: Partial<StripeCheckoutRedirectButtonProps> = {},
): StripeCheckoutRedirectButtonProps {
  const copy: StripeCheckoutRedirectButtonCopy = {
    landmarkLabel: "Payment method",
    helper: "Promo code (optional)",
    submit: "Continue to checkout",
  };
  const paymentMethodOptions: StripeCheckoutPaymentMethodOption[] = [
    { id: "EXPRESS", label: "Apple Pay / Google Pay" },
    { id: "PAYPAL", label: "PayPal" },
    { id: "CARD", label: "Card" },
    { id: "SEPA", label: "SEPA Direct Debit" },
  ];
  return {
    copy,
    formId: "stripe-checkout-mock",
    selectedPaymentMethod: undefined,
    paymentMethodOptions,
    promoCode: "",
    busy: false,
    message: "",
    onPaymentMethodChange: () => undefined,
    onPromoCodeChange: () => undefined,
    onSubmit: () => undefined,
    ...overrides,
  };
}
