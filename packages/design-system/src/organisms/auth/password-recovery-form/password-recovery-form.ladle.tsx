import { PasswordRecoveryFormPresentational } from "./password-recovery-form";
import { makeMockPasswordRecoveryFormProps } from "./password-recovery-form.mock";

export const Default = () => (
  <PasswordRecoveryFormPresentational
    {...makeMockPasswordRecoveryFormProps()}
  />
);

export const Submitting = () => (
  <PasswordRecoveryFormPresentational
    {...makeMockPasswordRecoveryFormProps({ isSubmitting: true })}
  />
);

export const WithError = () => (
  <PasswordRecoveryFormPresentational
    {...makeMockPasswordRecoveryFormProps({
      errorCode: "We could not send a recovery email right now.",
    })}
  />
);

export const Success = () => (
  <PasswordRecoveryFormPresentational
    {...makeMockPasswordRecoveryFormProps({ success: true })}
  />
);

export default {
  title: "Organisms / Auth / Password Recovery Form",
  parameters: { ladle: { skipCoverage: true } },
};
