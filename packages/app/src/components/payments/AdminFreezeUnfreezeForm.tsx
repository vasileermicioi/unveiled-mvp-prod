import { Button, Field, Panel, TextInput } from "@unveiled/design-system";
import { useContext, useId, useState } from "react";
import { LanguageContext } from "~/components/unveiled/context-primitives";
import { copyFor } from "~/lib/i18n";

export type AdminFreezeUnfreezeFormProps = {
  userId: string;
  isFrozen: boolean;
  onSubmit: (input: {
    userId: string;
    frozen: boolean;
    reason: string;
  }) => void | Promise<void>;
  resultMessage?: string;
  isSubmitting?: boolean;
};

export function AdminFreezeUnfreezeForm(props: AdminFreezeUnfreezeFormProps) {
  const language = useContext(LanguageContext);
  const copy = copyFor(language).payments.admin;
  const formLabelId = useId();
  const reasonInputId = useId();
  const errorRegionId = useId();
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = props.isSubmitting === true || isPending;
  const trimmedReason = reason.trim();

  const submit = async (frozen: boolean) => {
    if (busy) return;
    if (trimmedReason.length === 0) {
      setLocalError(copy.errorInvalidReason);
      return;
    }
    setLocalError(null);
    setIsPending(true);
    try {
      await props.onSubmit({
        userId: props.userId,
        frozen,
        reason: trimmedReason,
      });
    } finally {
      setIsPending(false);
    }
  };

  const errorText = localError ?? props.resultMessage ?? "";

  return (
    <Panel
      as="form"
      tone="white"
      aria-labelledby={formLabelId}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <h4 id={formLabelId} className="sr-only">
        {copy.freezeFormLabel}
      </h4>
      <Field label={copy.reasonLabel} htmlFor={reasonInputId}>
        <TextInput
          id={reasonInputId}
          name="reason"
          placeholder={copy.reasonPlaceholder}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          aria-describedby={errorRegionId}
          disabled={busy}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          onClick={() => void submit(true)}
          aria-label={copy.freezeSubmit}
          disabled={busy}
        >
          {copy.freezeSubmit}
        </Button>
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          onClick={() => void submit(false)}
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
    </Panel>
  );
}
