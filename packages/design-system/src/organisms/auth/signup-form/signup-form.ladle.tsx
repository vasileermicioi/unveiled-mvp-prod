import { SignupFormPresentational } from "./signup-form";
import { makeMockSignupFormProps } from "./signup-form.mock";

export const Default = () => (
  <SignupFormPresentational {...makeMockSignupFormProps()} />
);

export const Submitting = () => (
  <SignupFormPresentational
    {...makeMockSignupFormProps({ isSubmitting: true })}
  />
);

export const WithError = () => (
  <SignupFormPresentational
    {...makeMockSignupFormProps({
      errorCode: "An account with this email already exists.",
    })}
  />
);

export const Success = () => (
  <SignupFormPresentational {...makeMockSignupFormProps({ success: true })} />
);

export const Filled = () => (
  <SignupFormPresentational
    {...makeMockSignupFormProps({
      values: {
        firstName: "Alex",
        lastName: "Morgan",
        email: "pat@example.com",
        password: "sekret12345",
      },
    })}
  />
);

export default {
  title: "Organisms / Auth / Signup Form",
  parameters: { ladle: { skipCoverage: true } },
};
