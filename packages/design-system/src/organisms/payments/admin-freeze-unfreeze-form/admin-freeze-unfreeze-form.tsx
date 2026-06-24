import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { Button, TextInput } from "../../../atoms";
import { Field } from "../../../molecules/field";

export interface AdminFreezeUnfreezeFormCopy {
  reasonLabel: string;
  reasonPlaceholder: string;
  freezeSubmit: string;
  unfreezeSubmit: string;
  errorInvalidReason: string;
}

export interface AdminFreezeUnfreezeFormProps {
  copy: AdminFreezeUnfreezeFormCopy;
  reason: string;
  busy: boolean;
  errorText: string;
  formId: string;
  reasonInputId: string;
  errorRegionId: string;
  onReasonChange: (value: string) => void;
  onSubmit: (frozen: boolean) => void;
  onFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AdminFreezeUnfreezeFormPresentational(
  props: AdminFreezeUnfreezeFormProps,
): ReactElement {
  const {
    copy,
    reason,
    busy,
    errorText,
    formId,
    reasonInputId,
    errorRegionId,
    onReasonChange,
    onSubmit,
    onFormSubmit,
  } = props;
  return (
    <form
      aria-labelledby={formId}
      className="space-y-4 border-4 border-brand-dark bg-white p-4 md:p-6"
      onSubmit={onFormSubmit}
    >
      <h4 id={formId} className="sr-only">
        {copy.freezeSubmit} / {copy.unfreezeSubmit}
      </h4>
      <Field label={copy.reasonLabel} htmlFor={reasonInputId}>
        <TextInput
          id={reasonInputId}
          name="reason"
          placeholder={copy.reasonPlaceholder}
          value={reason}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onReasonChange(event.target.value)
          }
          aria-describedby={errorRegionId}
          disabled={busy}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          onClick={() => onSubmit(true)}
          aria-label={copy.freezeSubmit}
          disabled={busy}
        >
          {copy.freezeSubmit}
        </Button>
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          onClick={() => onSubmit(false)}
          aria-label={copy.unfreezeSubmit}
          disabled={busy}
        >
          {copy.unfreezeSubmit}
        </Button>
      </div>
      <p
        id={errorRegionId}
        aria-live="polite"
        className="text-xs font-bold uppercase tracking-widest opacity-75"
      >
        {errorText}
      </p>
    </form>
  );
}
