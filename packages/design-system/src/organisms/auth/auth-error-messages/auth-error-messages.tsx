import type { ReactElement } from "react";

export interface BetterAuthErrorMessagesLocalizedProps {
  helper: string;
  message: string;
}

export function BetterAuthErrorMessagesLocalizedPresentational({
  helper,
  message,
}: BetterAuthErrorMessagesLocalizedProps): ReactElement {
  return (
    <div className="grid gap-2 p-4">
      <p className="text-sm opacity-70">{helper}</p>
      <p role="alert" aria-live="assertive" className="text-sm font-bold">
        {message}
      </p>
    </div>
  );
}
