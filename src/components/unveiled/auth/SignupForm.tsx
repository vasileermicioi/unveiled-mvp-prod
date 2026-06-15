import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/unveiled-primitives";
import {
  copyFor,
  type UiLanguage,
} from "@/lib/i18n";

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignupFormProps {
  language: UiLanguage;
  isSubmitting?: boolean;
  onSubmit?: (values: SignupFormValues) => void | Promise<void>;
  errorCode?: string | null;
  success?: boolean;
}

const initialValues: SignupFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export function SignupForm({
  language,
  isSubmitting = false,
  onSubmit,
  errorCode,
  success = false,
}: SignupFormProps) {
  const formId = useId();
  const firstNameId = `${formId}-firstName`;
  const lastNameId = `${formId}-lastName`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const alertId = `${formId}-alert`;
  const copy = copyFor(language).auth.forms.signup;
  const [values, setValues] = useState<SignupFormValues>(initialValues);
  const [emailError, setEmailError] = useState<string | null>(null);

  function update<K extends keyof SignupFormValues>(
    key: K,
    next: SignupFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.email.includes("@")) {
      setEmailError("Enter a valid email");
      return;
    }
    setEmailError(null);
    void onSubmit?.(values);
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="grid gap-3 p-4"
      >
        <p>{copy.helper}</p>
      </div>
    );
  }

  return (
    <form
      role="form"
      aria-label={copy.title}
      className="grid gap-4"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.firstName} htmlFor={firstNameId}>
          <TextInput
            id={firstNameId}
            placeholder={copy.firstNamePlaceholder}
            value={values.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label={copy.lastName} htmlFor={lastNameId}>
          <TextInput
            id={lastNameId}
            placeholder={copy.lastNamePlaceholder}
            value={values.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            autoComplete="family-name"
          />
        </Field>
      </div>
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
          onChange={(event) => update("email", event.target.value)}
          autoComplete="email"
          aria-describedby={emailError ? alertId : undefined}
          aria-invalid={Boolean(emailError)}
        />
      </Field>
      <Field label={copy.password} htmlFor={passwordId}>
        <TextInput
          id={passwordId}
          type="password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          autoComplete="new-password"
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
    </form>
  );
}
