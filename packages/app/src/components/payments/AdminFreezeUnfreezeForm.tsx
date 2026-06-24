import {
  type AdminFreezeUnfreezeFormCopy,
  AdminFreezeUnfreezeFormPresentational,
} from "@unveiled/design-system";
import type { FormEvent } from "react";
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
  const formCopy: AdminFreezeUnfreezeFormCopy = {
    reasonLabel: copy.reasonLabel,
    reasonPlaceholder: copy.reasonPlaceholder,
    freezeSubmit: copy.freezeSubmit,
    unfreezeSubmit: copy.unfreezeSubmit,
    errorInvalidReason: copy.errorInvalidReason,
  };

  return (
    <AdminFreezeUnfreezeFormPresentational
      copy={formCopy}
      reason={reason}
      busy={busy}
      errorText={errorText}
      formId={formLabelId}
      reasonInputId={reasonInputId}
      errorRegionId={errorRegionId}
      onReasonChange={setReason}
      onSubmit={submit}
      onFormSubmit={(event: FormEvent<HTMLFormElement>) =>
        event.preventDefault()
      }
    />
  );
}
