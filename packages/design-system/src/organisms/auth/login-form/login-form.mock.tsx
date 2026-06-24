import type {
  LoginFormCopy,
  LoginFormPresentationalProps,
  LoginFormValues,
} from "./login-form";

export function makeMockLoginFormProps(
  overrides: Partial<LoginFormPresentationalProps> = {},
): LoginFormPresentationalProps {
  const copy: LoginFormCopy = {
    title: "Welcome back",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    submit: "Log in",
    forgotPassword: "Forgot password?",
    createAccount: "Create account",
  };
  const values: LoginFormValues = {
    email: "",
    password: "",
    redirect: null,
  };
  return {
    copy,
    values,
    formId: "login-form-mock",
    isSubmitting: false,
    errorMessage: null,
    redirectTarget: null,
    fallbackDestination: "/",
    onChange: () => undefined,
    onSubmit: () => undefined,
    ...overrides,
  };
}
