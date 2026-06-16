import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Panel, TextInput } from "@/components/ui/unveiled-primitives";
import { copyFor } from "@/lib/i18n";

import { LanguageContext } from "@/components/unveiled/context-primitives";

export type StripeCheckoutPaymentMethod =
  | "EXPRESS"
  | "PAYPAL"
  | "CARD"
  | "SEPA";

export type StripeCheckoutRedirectButtonProps = {
  selectedPaymentMethod: StripeCheckoutPaymentMethod | undefined;
  onPaymentMethodChange: (method: StripeCheckoutPaymentMethod) => void;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  message: string;
  isSubmitting?: boolean;
};

const paymentMethodOptions: Array<{
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
  const formLabelId = "stripe-checkout-form";

  const handleSubmit: React.FormEventHandler<HTMLElement> = (event) => {
    event.preventDefault();
    if (props.selectedPaymentMethod === undefined) return;
    setIsPending(true);
    void Promise.resolve(props.onSubmit()).finally(() => setIsPending(false));
  };

  return (
    <Panel
      as="form"
      tone="cream"
      aria-labelledby={formLabelId}
      className="space-y-5"
      onSubmit={handleSubmit}
    >
      <h2 id={formLabelId} className="sr-only">
        {copy.landmarkLabel}
      </h2>
      <p className="sr-only">{copy.helper}</p>
      <fieldset
        className="grid gap-3"
        aria-label={copy.landmarkLabel}
        disabled={busy}
      >
        <legend className="sr-only">{copy.landmarkLabel}</legend>
        {paymentMethodOptions.map((option) => {
          const checked = props.selectedPaymentMethod === option.id;
          return (
            <label
              key={option.id}
              className="flex items-center justify-between border-4 border-brand-dark bg-white px-4 py-4 text-left text-xs font-black uppercase tracking-widest"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={checked}
                onChange={() => props.onPaymentMethodChange(option.id)}
                className="sr-only"
              />
              <span
                className={
                  checked ? "text-brand-dark" : "text-brand-dark opacity-60"
                }
              >
                {language === "DE" ? option.labelDE : option.labelEN}
              </span>
              <span aria-hidden="true">{"→"}</span>
            </label>
          );
        })}
      </fieldset>
      <Field label={copy.helper}>
        <TextInput
          name="promoCode"
          placeholder={copy.helper}
          value={props.promoCode}
          onChange={(event) => props.onPromoCodeChange(event.target.value)}
        />
      </Field>
      <Button
        type="submit"
        className="w-full"
        disabled={busy || props.selectedPaymentMethod === undefined}
        aria-label={copy.submit}
      >
        {copy.submit}
      </Button>
      <p className="text-xs font-bold uppercase tracking-widest opacity-55">
        {props.message}
      </p>
    </Panel>
  );
}
