import type { BetterAuthErrorMessagesLocalizedProps } from "./auth-error-messages";

export function makeMockBetterAuthErrorMessagesLocalizedProps(
  overrides: Partial<BetterAuthErrorMessagesLocalizedProps> = {},
): BetterAuthErrorMessagesLocalizedProps {
  return {
    helper: "Enter your email to receive recovery instructions.",
    message: "Email or password is incorrect.",
    ...overrides,
  };
}
