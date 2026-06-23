import { Button, Field, TextInput } from "@unveiled/design-system";
import { useId, useState } from "react";
import { copyFor, type UiLanguage } from "~/lib/i18n";

export interface PasswordRecoveryFormValues {
  email: string;
}

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
  const emailId = `${formId}-email`;
  const alertId = `${formId}-alert`;
  const copy = copyFor(language).auth.forms.passwordRecovery;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setEmailError("Enter a valid email");
      return;
    }
    setEmailError(null);
    void onSubmit?.({ email });
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
        onClick={(event) => event.preventDefault()}
      >
        {copy.backToLogin}
      </button>
    </form>
  );
}
