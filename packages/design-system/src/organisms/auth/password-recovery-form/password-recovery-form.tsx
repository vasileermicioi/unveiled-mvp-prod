import type { ChangeEvent, FormEvent, ReactElement } from "react";
import * as React from "react";
import { Button, TextInput } from "../../../atoms";
import { Field } from "../../../molecules/field";

export interface PasswordRecoveryFormCopy {
  title: string;
  email: string;
  emailPlaceholder: string;
  submit: string;
  backToLogin: string;
  success: string;
}

export interface PasswordRecoveryFormValues {
  email: string;
}

export interface PasswordRecoveryFormPresentationalProps {
  copy: PasswordRecoveryFormCopy;
  values: PasswordRecoveryFormValues;
  isSubmitting?: boolean;
  success?: boolean;
  errorCode?: string | null;
  formId: string;
  onChange: (next: PasswordRecoveryFormValues) => void;
  onSubmit: (values: PasswordRecoveryFormValues) => void;
  onBackToLogin?: () => void;
}

export function PasswordRecoveryFormPresentational(
  props: PasswordRecoveryFormPresentationalProps,
): ReactElement {
  const {
    copy,
    values,
    isSubmitting = false,
    success = false,
    errorCode,
    formId,
    onChange,
    onSubmit,
    onBackToLogin,
  } = props;
  const emailId = `${formId}-email`;
  const alertId = `${formId}-alert`;
  const [emailError, setEmailError] = React.useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.email.includes("@")) {
      setEmailError("Enter a valid email");
      return;
    }
    setEmailError(null);
    onSubmit({ email: values.email });
  }

  if (success) {
    return (
      <p role="status" aria-live="polite" className="p-4 text-sm font-bold">
        {copy.success}
      </p>
    );
  }

  return (
    <form
      aria-label={copy.title}
      className="grid gap-4"
      onSubmit={handleSubmit}
    >
      <Field
        label={copy.email}
        htmlFor={emailId}
        error={emailError ?? undefined}
      >
        <TextInput
          id={emailId}
          type="email"
          placeholder={copy.emailPlaceholder}
          value={values.email}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange({ email: event.target.value })
          }
          autoComplete="email"
          aria-describedby={emailError ? alertId : undefined}
          aria-invalid={Boolean(emailError)}
        />
      </Field>
      {errorCode ? (
        <p id={alertId} role="alert" className="text-sm font-bold">
          {errorCode}
        </p>
      ) : null}
      <Button type="submit" className="w-full" loading={isSubmitting}>
        {copy.submit}
      </Button>
      <button
        type="button"
        className="text-sm underline opacity-70"
        onClick={(event) => {
          event.preventDefault();
          onBackToLogin?.();
        }}
      >
        {copy.backToLogin}
      </button>
    </form>
  );
}
