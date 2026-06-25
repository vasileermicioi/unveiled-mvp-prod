import type { ChangeEvent, FormEvent, ReactElement, ReactNode } from "react";
import { Button, TextInput } from "../../../atoms";
import { Field } from "../../../molecules/field";

export interface LoginFormCopy {
  title: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  forgotPassword: string;
  createAccount: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  redirect: string | null;
}

export interface LoginFormPresentationalProps {
  copy: LoginFormCopy;
  values: LoginFormValues;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  redirectTarget?: string | null;
  fallbackDestination?: string;
  cancelRedirectLabel?: string;
  formId: string;
  footerSlot?: ReactNode;
  onChange: (next: LoginFormValues) => void;
  onSubmit: (values: LoginFormValues) => void;
  onCancelRedirect?: () => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export function LoginFormPresentational(
  props: LoginFormPresentationalProps,
): ReactElement {
  const {
    copy,
    values,
    isSubmitting = false,
    errorMessage,
    redirectTarget = null,
    fallbackDestination = "/",
    cancelRedirectLabel,
    formId,
    footerSlot,
    onChange,
    onSubmit,
    onCancelRedirect,
    onForgotPassword,
    onCreateAccount,
  } = props;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const alertId = `${formId}-alert`;
  const deepLinkId = `${formId}-deep-link`;
  const cancelId = `${formId}-deep-link-cancel`;
  const redirectInputId = `${formId}-redirect-input`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ...values, redirect: redirectTarget });
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...values, email: event.target.value });
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...values, password: event.target.value });
  }

  const showDeepLink = redirectTarget !== null;
  const previewText =
    cancelRedirectLabel !== undefined && showDeepLink
      ? `${redirectTarget}`
      : "";

  return (
    <form
      aria-label={copy.title}
      className="grid gap-4"
      onSubmit={handleSubmit}
    >
      {showDeepLink ? (
        <div
          id={deepLinkId}
          role="note"
          className="rounded-md border border-border bg-muted/40 p-3 text-sm"
        >
          <p>{previewText}</p>
          <input
            id={redirectInputId}
            type="hidden"
            name="redirect"
            value={redirectTarget ?? ""}
            readOnly
          />
          <Button
            id={cancelId}
            type="button"
            variant="ghost"
            className="mt-2 p-0 h-auto underline"
            onClick={onCancelRedirect ?? (() => undefined)}
          >
            {cancelRedirectLabel ?? ""} {fallbackDestination}
          </Button>
        </div>
      ) : null}
      <Field label={copy.email} htmlFor={emailId}>
        <TextInput
          id={emailId}
          type="email"
          placeholder={copy.emailPlaceholder}
          value={values.email}
          onChange={handleEmailChange}
          autoComplete="email"
        />
      </Field>
      <Field label={copy.password} htmlFor={passwordId}>
        <TextInput
          id={passwordId}
          type="password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={handlePasswordChange}
          autoComplete="current-password"
        />
      </Field>
      {errorMessage ? (
        <p id={alertId} role="alert" className="text-sm font-bold">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" className="w-full" loading={isSubmitting}>
        {copy.submit}
      </Button>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button
          type="button"
          className="underline opacity-70"
          onClick={(event) => {
            event.preventDefault();
            onForgotPassword?.();
          }}
        >
          {copy.forgotPassword}
        </button>
        <button
          type="button"
          className="underline opacity-70"
          onClick={(event) => {
            event.preventDefault();
            onCreateAccount?.();
          }}
        >
          {copy.createAccount}
        </button>
      </div>
      {footerSlot ? <div className="text-sm">{footerSlot}</div> : null}
    </form>
  );
}
