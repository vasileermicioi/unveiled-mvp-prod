import { LoginFormPresentational } from "./login-form";
import { makeMockLoginFormProps } from "./login-form.mock";

export const Default = () => (
  <LoginFormPresentational {...makeMockLoginFormProps()} />
);

export const Submitting = () => (
  <LoginFormPresentational
    {...makeMockLoginFormProps({ isSubmitting: true })}
  />
);

export const WithError = () => (
  <LoginFormPresentational
    {...makeMockLoginFormProps({ errorMessage: "Invalid email or password." })}
  />
);

export const WithDeepLink = () => (
  <LoginFormPresentational
    {...makeMockLoginFormProps({
      redirectTarget: "/app/profile",
      cancelRedirectLabel: "Cancel — go to",
      onCancelRedirect: () => undefined,
    })}
  />
);

export const Filled = () => {
  const filled = makeMockLoginFormProps({
    values: { email: "pat@example.com", password: "sekret123", redirect: null },
  });
  return <LoginFormPresentational {...filled} />;
};

export default {
  title: "Organisms / Auth / Login Form",
  parameters: { ladle: { skipCoverage: true } },
};
