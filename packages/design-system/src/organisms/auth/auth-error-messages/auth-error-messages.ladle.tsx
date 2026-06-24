import { BetterAuthErrorMessagesLocalizedPresentational } from "./auth-error-messages";
import { makeMockBetterAuthErrorMessagesLocalizedProps } from "./auth-error-messages.mock";

export const Default = () => (
  <BetterAuthErrorMessagesLocalizedPresentational
    {...makeMockBetterAuthErrorMessagesLocalizedProps()}
  />
);

export const TooManyRequests = () => (
  <BetterAuthErrorMessagesLocalizedPresentational
    {...makeMockBetterAuthErrorMessagesLocalizedProps({
      message: "Too many attempts. Please try again in a few minutes.",
    })}
  />
);

export const Empty = () => (
  <BetterAuthErrorMessagesLocalizedPresentational
    {...makeMockBetterAuthErrorMessagesLocalizedProps({ message: "" })}
  />
);

export default {
  title: "Organisms / Auth / Error Messages",
  parameters: { ladle: { skipCoverage: true } },
};
