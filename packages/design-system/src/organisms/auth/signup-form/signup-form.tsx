import type { ChangeEvent, FormEvent, ReactElement, ReactNode } from "react";
import * as React from "react";
import { Button, TextInput } from "../../../atoms";
import { Field } from "../../../molecules/field";

export interface SignupFormCopy {
  title: string;
  firstName: string;
  firstNamePlaceholder: string;
  lastName: string;
  lastNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  helper: string;
  switchToLogin: string;
}

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignupFormPresentationalProps {
  copy: SignupFormCopy;
  values: SignupFormValues;
  isSubmitting?: boolean;
  errorCode?: string | null;
  success?: boolean;
  formId: string;
  footerSlot?: ReactNode;
  onChange: (next: SignupFormValues) => void;
  onSubmit: (values: SignupFormValues) => void;
  onSwitchToLogin?: () => void;
}

export function SignupFormPresentational(
  props: SignupFormPresentationalProps,
): ReactElement {
  const {
    copy,
    values,
    isSubmitting = false,
    errorCode,
    success = false,
    formId,
    footerSlot,
    onChange,
    onSubmit,
    onSwitchToLogin,
  } = props;
  const firstNameId = `${formId}-firstName`;
  const lastNameId = `${formId}-lastName`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const alertId = `${formId}-alert`;
  const [emailError, setEmailError] = React.useState<string | null>(null);

  function update<K extends keyof SignupFormValues>(
    key: K,
    next: SignupFormValues[K],
  ) {
    onChange({ ...values, [key]: next });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.email.includes("@")) {
      setEmailError("Enter a valid email");
      return;
    }
    setEmailError(null);
    onSubmit(values);
  }

  if (success) {
    return (
      <div role="status" aria-live="polite" className="grid gap-3 p-4">
        <p>{copy.helper}</p>
      </div>
    );
  }

  return (
    <form
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
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              update("firstName", event.target.value)
            }
            autoComplete="given-name"
          />
        </Field>
        <Field label={copy.lastName} htmlFor={lastNameId}>
          <TextInput
            id={lastNameId}
            placeholder={copy.lastNamePlaceholder}
            value={values.lastName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              update("lastName", event.target.value)
            }
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
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update("email", event.target.value)
          }
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
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update("password", event.target.value)
          }
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
      {footerSlot ? (
        <div className="text-sm">{footerSlot}</div>
      ) : onSwitchToLogin ? (
        <div className="text-sm">
          <button
            type="button"
            className="underline opacity-70"
            onClick={(event) => {
              event.preventDefault();
              onSwitchToLogin();
            }}
          >
            {copy.switchToLogin}
          </button>
        </div>
      ) : null}
    </form>
  );
}
