import { BetterAuthErrorMessagesLocalizedPresentational } from "@unveiled/design-system";
import { copyFor, mapAuthError } from "~/lib/i18n";

export interface BetterAuthErrorMessagesLocalizedProps {
  language: import("~/lib/i18n").UiLanguage;
  code: string | null;
}

export function BetterAuthErrorMessagesLocalized({
  language,
  code,
}: BetterAuthErrorMessagesLocalizedProps) {
  const helper = copyFor(language).auth.forms.passwordRecovery.helper;
  const message = mapAuthError(code, language);
  return (
    <BetterAuthErrorMessagesLocalizedPresentational
      helper={helper}
      message={message}
    />
  );
}
