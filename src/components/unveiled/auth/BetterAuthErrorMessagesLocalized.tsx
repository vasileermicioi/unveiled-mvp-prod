import { copyFor, mapAuthError, type UiLanguage } from "@/lib/i18n";

export interface BetterAuthErrorMessagesLocalizedProps {
  language: UiLanguage;
  code: string | null;
}

export function BetterAuthErrorMessagesLocalized({
  language,
  code,
}: BetterAuthErrorMessagesLocalizedProps) {
  const helper = copyFor(language).auth.forms.passwordRecovery.helper;
  const message = mapAuthError(code, language);
  return (
    <div className="grid gap-2 p-4">
      <p className="text-sm opacity-70">{helper}</p>
      <p role="alert" aria-live="assertive" className="text-sm font-bold">
        {message}
      </p>
    </div>
  );
}
