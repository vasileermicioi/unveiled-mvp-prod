import {
  type PasswordRecoveryFormCopy,
  PasswordRecoveryFormPresentational,
  type PasswordRecoveryFormValues,
} from "@unveiled/design-system";
import { useId, useState } from "react";
import { copyFor, type UiLanguage } from "~/lib/i18n";

export type { PasswordRecoveryFormValues };

export interface PasswordRecoveryFormProps {
  language: UiLanguage;
  isSubmitting?: boolean;
  onSubmit?: (values: PasswordRecoveryFormValues) => void | Promise<void>;
  success?: boolean;
  errorCode?: string | null;
}

export function PasswordRecoveryForm({
  language,
  isSubmitting = false,
  onSubmit,
  success = false,
  errorCode,
}: PasswordRecoveryFormProps) {
  const formId = useId();
  const copy = copyFor(language).auth.forms.passwordRecovery;
  const [values, setValues] = useState<PasswordRecoveryFormValues>({
    email: "",
  });

  const recoveryCopy: PasswordRecoveryFormCopy = {
    title: copy.title,
    email: copy.email,
    emailPlaceholder: copy.emailPlaceholder,
    submit: copy.submit,
    backToLogin: copy.backToLogin,
    success: copy.success,
  };

  return (
    <PasswordRecoveryFormPresentational
      copy={recoveryCopy}
      values={values}
      formId={formId}
      isSubmitting={isSubmitting}
      success={success}
      errorCode={errorCode}
      onChange={setValues}
      onSubmit={(next) => onSubmit?.(next)}
    />
  );
}
