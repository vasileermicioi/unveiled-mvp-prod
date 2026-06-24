import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { Button, TextInput } from "../../../atoms";
import { Field } from "../../../molecules/field";

export type StripeCheckoutPaymentMethod =
  | "EXPRESS"
  | "PAYPAL"
  | "CARD"
  | "SEPA";

export interface StripeCheckoutPaymentMethodOption {
  id: StripeCheckoutPaymentMethod;
  label: string;
}

export interface StripeCheckoutRedirectButtonCopy {
  landmarkLabel: string;
  helper: string;
  submit: string;
}

export interface StripeCheckoutRedirectButtonProps {
  copy: StripeCheckoutRedirectButtonCopy;
  formId: string;
  selectedPaymentMethod: StripeCheckoutPaymentMethod | undefined;
  paymentMethodOptions: StripeCheckoutPaymentMethodOption[];
  promoCode: string;
  busy: boolean;
  message: string;
  onPaymentMethodChange: (method: StripeCheckoutPaymentMethod) => void;
  onPromoCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function StripeCheckoutRedirectButtonPresentational(
  props: StripeCheckoutRedirectButtonProps,
): ReactElement {
  const {
    copy,
    formId,
    selectedPaymentMethod,
    paymentMethodOptions,
    promoCode,
    busy,
    message,
    onPaymentMethodChange,
    onPromoCodeChange,
    onSubmit,
  } = props;
  return (
    <form
      aria-labelledby={formId}
      className="space-y-5 border-4 border-brand-dark bg-brand-cream p-5 md:p-7"
      onSubmit={onSubmit}
    >
      <h2 id={formId} className="sr-only">
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
          const checked = selectedPaymentMethod === option.id;
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
                onChange={() => onPaymentMethodChange(option.id)}
                className="sr-only"
              />
              <span
                className={
                  checked ? "text-brand-dark" : "text-brand-dark opacity-60"
                }
              >
                {option.label}
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
          value={promoCode}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onPromoCodeChange(event.target.value)
          }
        />
      </Field>
      <Button
        type="submit"
        className="w-full"
        disabled={busy || selectedPaymentMethod === undefined}
        aria-label={copy.submit}
      >
        {copy.submit}
      </Button>
      <p className="text-xs font-bold uppercase tracking-widest opacity-55">
        {message}
      </p>
    </form>
  );
}
