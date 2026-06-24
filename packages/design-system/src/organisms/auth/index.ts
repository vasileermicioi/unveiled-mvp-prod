export * from "./auth-error-messages";
export * from "./login-form";
export * from "./logout-flow";
export * from "./password-recovery-form";
export * from "./signup-form";

import * as AuthErrorMessages from "./auth-error-messages";
import * as LoginForm from "./login-form";
import * as LogoutFlow from "./logout-flow";
import * as PasswordRecoveryForm from "./password-recovery-form";
import * as SignupForm from "./signup-form";

export const Auth = {
  ...AuthErrorMessages,
  ...LoginForm,
  ...LogoutFlow,
  ...PasswordRecoveryForm,
  ...SignupForm,
} as const;
