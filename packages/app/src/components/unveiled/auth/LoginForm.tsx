import {
  type LoginFormCopy,
  LoginFormPresentational,
  type LoginFormValues,
} from "@unveiled/design-system";
import { useId, useState } from "react";
import { copyFor, type UiLanguage } from "~/lib/i18n";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
  redirect: null,
};

export type { LoginFormValues };

export interface LoginFormProps {
  language: UiLanguage;
  isSubmitting?: boolean;
  onSubmit?: (values: LoginFormValues) => void | Promise<void>;
  errorMessage?: string | null;
  redirectTarget?: string | null;
  fallbackDestination?: string;
  onCancelRedirect?: () => void;
}

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
  const copy = copyFor(language).auth.forms.login;
  const deepLinkCopy = copyFor(language).routing.deepLink;
  const [values, setValues] = useState<LoginFormValues>(initialValues);

  const loginCopy: LoginFormCopy = {
    title: copy.title,
    email: copy.email,
    emailPlaceholder: copy.emailPlaceholder,
    password: copy.password,
    passwordPlaceholder: copy.passwordPlaceholder,
    submit: copy.submit,
    forgotPassword: copy.forgotPassword,
    createAccount: copy.createAccount,
  };

  return (
    <LoginFormPresentational
      copy={loginCopy}
      values={values}
      formId={formId}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      redirectTarget={redirectTarget}
      fallbackDestination={fallbackDestination}
      cancelRedirectLabel={deepLinkCopy.cancel}
      onChange={setValues}
      onSubmit={(next) => onSubmit?.({ ...next, redirect: redirectTarget })}
      onCancelRedirect={onCancelRedirect}
    />
  );
}
