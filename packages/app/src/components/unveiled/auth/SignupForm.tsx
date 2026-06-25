import {
  type SignupFormCopy,
  SignupFormPresentational,
  type SignupFormValues,
} from "@unveiled/design-system";
import type * as React from "react";
import { useId, useState } from "react";
import { copyFor, type UiLanguage } from "~/lib/i18n";

const initialValues: SignupFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export type { SignupFormValues };

export interface SignupFormProps {
  language: UiLanguage;
  isSubmitting?: boolean;
  onSubmit?: (values: SignupFormValues) => void | Promise<void>;
  errorCode?: string | null;
  success?: boolean;
  footerSlot?: React.ReactNode;
  onSwitchToLogin?: () => void;
}

export function SignupForm({
  language,
  isSubmitting = false,
  onSubmit,
  errorCode,
  success = false,
  footerSlot,
  onSwitchToLogin,
}: SignupFormProps) {
  const formId = useId();
  const copy = copyFor(language).auth.forms.signup;
  const [values, setValues] = useState<SignupFormValues>(initialValues);

  const signupCopy: SignupFormCopy = {
    title: copy.title,
    firstName: copy.firstName,
    firstNamePlaceholder: copy.firstNamePlaceholder,
    lastName: copy.lastName,
    lastNamePlaceholder: copy.lastNamePlaceholder,
    email: copy.email,
    emailPlaceholder: copy.emailPlaceholder,
    password: copy.password,
    passwordPlaceholder: copy.passwordPlaceholder,
    submit: copy.submit,
    helper: copy.helper,
    switchToLogin: copy.switchToLogin,
  };

  return (
    <SignupFormPresentational
      copy={signupCopy}
      values={values}
      formId={formId}
      isSubmitting={isSubmitting}
      errorCode={errorCode}
      success={success}
      footerSlot={footerSlot}
      onSwitchToLogin={onSwitchToLogin}
      onChange={setValues}
      onSubmit={(next) => onSubmit?.(next)}
    />
  );
}
