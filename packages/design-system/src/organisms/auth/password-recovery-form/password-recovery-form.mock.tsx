import type {
  PasswordRecoveryFormCopy,
  PasswordRecoveryFormPresentationalProps,
  PasswordRecoveryFormValues,
} from "./password-recovery-form";

export function makeMockPasswordRecoveryFormProps(
  overrides: Partial<PasswordRecoveryFormPresentationalProps> = {},
): PasswordRecoveryFormPresentationalProps {
  const copy: PasswordRecoveryFormCopy = {
    title: "Reset password",
    email: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Send reset link",
    backToLogin: "Back to login",
    success:
      "If an account exists for this email, recovery instructions have been sent.",
  };
  const values: PasswordRecoveryFormValues = { email: "" };
  return {
    copy,
    values,
    formId: "password-recovery-form-mock",
    isSubmitting: false,
    success: false,
    errorCode: null,
    onChange: () => undefined,
    onSubmit: () => undefined,
    ...overrides,
  };
}
