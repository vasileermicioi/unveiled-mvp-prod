import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/unveiled-primitives";
import { copyFor, type UiLanguage } from "@/lib/i18n";

export interface LoginFormValues {
  email: string;
  password: string;
  redirect: string | null;
}

export interface LoginFormProps {
  language: UiLanguage;
  isSubmitting?: boolean;
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  errorMessage?: string | null;
  redirectTarget?: string | null;
  fallbackDestination?: string;
  onCancelRedirect?: () => void;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
  redirect: null,
};

export function LoginForm({
  language,
  isSubmitting = false,
  onSubmit,
  errorMessage,
  redirectTarget = null,
  fallbackDestination = "/",
  onCancelRedirect,
}: LoginFormProps) {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const alertId = `${formId}-alert`;
  const deepLinkId = `${formId}-deep-link`;
  const cancelId = `${formId}-deep-link-cancel`;
  const redirectInputId = `${formId}-redirect-input`;
  const copy = copyFor(language).auth.forms.login;
  const deepLinkCopy = copyFor(language).routing.deepLink;
  const [values, setValues] = useState<LoginFormValues>(initialValues);

  function update<K extends keyof LoginFormValues>(
    key: K,
    next: LoginFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit?.({ ...values, redirect: redirectTarget });
  }

  const showDeepLink = redirectTarget !== null;
  const previewText = showDeepLink
    ? deepLinkCopy.preview.replace("{destination}", redirectTarget)
    : "";

  return (
    <form
      role="form"
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
            {deepLinkCopy.cancel} {fallbackDestination}
          </Button>
        </div>
      ) : null}
      <Field label={copy.email} htmlFor={emailId}>
        <TextInput
          id={emailId}
          type="email"
          placeholder={copy.emailPlaceholder}
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          autoComplete="email"
        />
      </Field>
      <Field label={copy.password} htmlFor={passwordId}>
        <TextInput
          id={passwordId}
          type="password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
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
        <a
          href="#"
          className="underline opacity-70"
          onClick={(event) => event.preventDefault()}
        >
          {copy.forgotPassword}
        </a>
        <a
          href="#"
          className="underline opacity-70"
          onClick={(event) => event.preventDefault()}
        >
          {copy.createAccount}
        </a>
      </div>
    </form>
  );
}
