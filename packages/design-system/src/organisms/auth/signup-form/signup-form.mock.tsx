import type {
  SignupFormCopy,
  SignupFormPresentationalProps,
  SignupFormValues,
} from "./signup-form";

export function makeMockSignupFormProps(
  overrides: Partial<SignupFormPresentationalProps> = {},
): SignupFormPresentationalProps {
  const copy: SignupFormCopy = {
    title: "Become a member",
    firstName: "First name",
    firstNamePlaceholder: "Alex",
    lastName: "Last name",
    lastNamePlaceholder: "Morgan",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    submit: "Start membership",
    helper: "Membership unlocks curated invitations to Berlin's live events.",
  };
  const values: SignupFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };
  return {
    copy,
    values,
    formId: "signup-form-mock",
    isSubmitting: false,
    errorCode: null,
    success: false,
    onChange: () => undefined,
    onSubmit: () => undefined,
    ...overrides,
  };
}
