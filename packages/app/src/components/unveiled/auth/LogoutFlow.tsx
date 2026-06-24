import {
  type LogoutFlowCopy,
  LogoutFlowPresentational,
} from "@unveiled/design-system";
import { useId, useState } from "react";
import { copyFor, type UiLanguage } from "~/lib/i18n";

export interface LogoutFlowProps {
  language: UiLanguage;
  onLogOut?: () => void | Promise<void>;
  onLogOutEverywhere?: () => void | Promise<void>;
  onOpenProfile?: () => void;
}

export function LogoutFlow({
  language,
  onLogOut,
  onLogOutEverywhere,
  onOpenProfile,
}: LogoutFlowProps) {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const copy = copyFor(language).auth.forms.logout;

  const logoutCopy: LogoutFlowCopy = {
    trigger: copy.trigger,
    menuLabel: copy.menuLabel,
    profile: copy.profile,
    logOut: copy.logOut,
    logOutEverywhere: copy.logOutEverywhere,
  };

  return (
    <LogoutFlowPresentational
      copy={logoutCopy}
      open={open}
      formId={formId}
      onToggle={() => setOpen((prev) => !prev)}
      onOpenProfile={() => {
        setOpen(false);
        onOpenProfile?.();
      }}
      onLogOut={() => {
        setOpen(false);
        void onLogOut?.();
      }}
      onLogOutEverywhere={() => {
        setOpen(false);
        void onLogOutEverywhere?.();
      }}
    />
  );
}
