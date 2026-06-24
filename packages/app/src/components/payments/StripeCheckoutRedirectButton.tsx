import {
  type StripeCheckoutPaymentMethod,
  type StripeCheckoutPaymentMethodOption,
  type StripeCheckoutRedirectButtonCopy,
  StripeCheckoutRedirectButtonPresentational,
} from "@unveiled/design-system";
import type { FormEvent } from "react";
import { useContext, useState } from "react";
import { LanguageContext } from "~/components/unveiled/context-primitives";
import { copyFor } from "~/lib/i18n";

export type { StripeCheckoutPaymentMethod };

export type StripeCheckoutRedirectButtonProps = {
  selectedPaymentMethod: StripeCheckoutPaymentMethod | undefined;
  onPaymentMethodChange: (method: StripeCheckoutPaymentMethod) => void;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  message: string;
  isSubmitting?: boolean;
};

const PAYMENT_METHOD_OPTIONS: Array<{
  id: StripeCheckoutPaymentMethod;
  labelDE: string;
  labelEN: string;
}> = [
  {
    id: "EXPRESS",
    labelDE: "Apple Pay / Google Pay",
    labelEN: "Apple Pay / Google Pay",
  },
  { id: "PAYPAL", labelDE: "PayPal", labelEN: "PayPal" },
  { id: "CARD", labelDE: "Kreditkarte", labelEN: "Card" },
  { id: "SEPA", labelDE: "SEPA-Lastschrift", labelEN: "SEPA Direct Debit" },
];

export function StripeCheckoutRedirectButton(
  props: StripeCheckoutRedirectButtonProps,
) {
  const language = useContext(LanguageContext);
  const copy = copyFor(language).payments.checkout;
  const [isPending, setIsPending] = useState(false);

  const busy = props.isSubmitting === true || isPending;

  const paymentMethodOptions: StripeCheckoutPaymentMethodOption[] =
    PAYMENT_METHOD_OPTIONS.map((option) => ({
      id: option.id,
      label: language === "DE" ? option.labelDE : option.labelEN,
    }));

  const buttonCopy: StripeCheckoutRedirectButtonCopy = {
    landmarkLabel: copy.landmarkLabel,
    helper: copy.helper,
    submit: copy.submit,
  };

  return (
    <StripeCheckoutRedirectButtonPresentational
      copy={buttonCopy}
      formId="stripe-checkout-form"
      selectedPaymentMethod={props.selectedPaymentMethod}
      paymentMethodOptions={paymentMethodOptions}
      promoCode={props.promoCode}
      busy={busy}
      message={props.message}
      onPaymentMethodChange={props.onPaymentMethodChange}
      onPromoCodeChange={props.onPromoCodeChange}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (props.selectedPaymentMethod === undefined) return;
        setIsPending(true);
        void Promise.resolve(props.onSubmit()).finally(() =>
          setIsPending(false),
        );
      }}
    />
  );
}
