import type { ReactElement, ReactNode } from "react";
import { Button } from "../../../atoms/button";

export interface BookingModalHeaderProps {
  categoryAndPartner: string;
  title: string;
}

export function BookingModalHeaderPresentational({
  categoryAndPartner,
  title,
}: BookingModalHeaderProps): ReactElement {
  return (
    <div>
      <p className="unveiled-meta opacity-45">{categoryAndPartner}</p>
      <h2 className="headline-lg mt-4">{title}</h2>
    </div>
  );
}

export interface BookingModalSummaryProps {
  description: string;
  whenLabel: string;
  whenValue: string;
  whereLabel: string;
  whereValue: string;
}

export function BookingModalSummaryPresentational(
  props: BookingModalSummaryProps,
): ReactElement {
  const { description, whenLabel, whenValue, whereLabel, whereValue } = props;
  return (
    <>
      <p className="max-w-2xl text-xl font-bold leading-relaxed opacity-80">
        {description}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 border-t-2 border-brand-dark/15 pt-6">
        <div>
          <p className="unveiled-meta opacity-45">{whenLabel}</p>
          <p className="mt-2 text-2xl font-black uppercase tracking-tight">
            {whenValue}
          </p>
        </div>
        <div>
          <p className="unveiled-meta opacity-45">{whereLabel}</p>
          <p className="mt-2 text-2xl font-black uppercase tracking-tight">
            {whereValue}
          </p>
        </div>
      </div>
    </>
  );
}

export interface BookingModalFormProps {
  ticketsLabel: string;
  totalLabel: string;
  totalValue: string;
  count: number;
  minCount: number;
  maxCount: number;
  submitLabel: string;
  submitting: boolean;
  disabled: boolean;
  minusIcon: ReactNode;
  plusIcon: ReactNode;
  spinnerIcon: ReactNode;
  trailingIcon: ReactNode;
  onDecrement: () => void;
  onIncrement: () => void;
  onSubmit: () => void;
}

export function BookingModalFormPresentational(
  props: BookingModalFormProps,
): ReactElement {
  const {
    ticketsLabel,
    totalLabel,
    totalValue,
    count,
    minCount,
    maxCount,
    submitLabel,
    submitting,
    disabled,
    minusIcon,
    plusIcon,
    spinnerIcon,
    trailingIcon,
    onDecrement,
    onIncrement,
    onSubmit,
  } = props;
  return (
    <section className="space-y-8 border-4 border-brand-dark bg-brand-dark p-5 text-white md:p-7">
      <div className="flex items-center justify-between gap-4">
        <span className="unveiled-meta opacity-55">{ticketsLabel}</span>
        <div className="flex items-center gap-7 font-display text-5xl font-black">
          <button
            type="button"
            aria-label="Decrement tickets"
            onClick={onDecrement}
            disabled={count <= minCount}
          >
            <span className="inline-flex items-center justify-center size-8">
              {minusIcon}
            </span>
          </button>
          {count}
          <button
            type="button"
            aria-label="Increment tickets"
            onClick={onIncrement}
            disabled={count >= maxCount}
          >
            <span className="inline-flex items-center justify-center size-8">
              {plusIcon}
            </span>
          </button>
        </div>
      </div>
      <div className="bg-brand-yellow/25 h-px w-full" />
      <div className="flex items-end justify-between gap-4">
        <span className="unveiled-meta opacity-55">{totalLabel}</span>
        <span className="font-display text-5xl font-black uppercase">
          {totalValue}
        </span>
      </div>
      <Button
        type="button"
        variant="yellow"
        className="w-full"
        disabled={disabled || submitting}
        onClick={onSubmit}
      >
        {submitting ? (
          <span className="inline-flex items-center mr-2 size-4 animate-spin">
            {spinnerIcon}
          </span>
        ) : null}
        {submitLabel}
        <span className="ml-2 inline-flex items-center justify-center size-4">
          {trailingIcon}
        </span>
      </Button>
    </section>
  );
}

export interface BookingModalActionsProps {
  returnLabel: string;
  onReturn: () => void;
}

export function BookingModalActionsPresentational({
  returnLabel,
  onReturn,
}: BookingModalActionsProps): ReactElement {
  return (
    <button
      type="button"
      className="text-sm font-black uppercase tracking-widest underline opacity-70"
      onClick={onReturn}
    >
      {returnLabel}
    </button>
  );
}
