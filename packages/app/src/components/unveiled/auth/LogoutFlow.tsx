import { useId, useState } from "react";

import { Button } from "@unveiled/design-system";
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
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const copy = copyFor(language).auth.forms.logout;

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {copy.trigger}
      </Button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={copy.menuLabel}
          className="absolute right-0 z-10 mt-2 grid w-56 gap-1 border-4 border-brand-dark bg-white p-1"
        >
          <li role="none">
            <button
              role="menuitem"
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-bold"
              onClick={() => {
                setOpen(false);
                onOpenProfile?.();
              }}
            >
              {copy.profile}
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-bold"
              onClick={() => {
                setOpen(false);
                void onLogOut?.();
              }}
            >
              {copy.logOut}
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-bold"
              onClick={() => {
                setOpen(false);
                void onLogOutEverywhere?.();
              }}
            >
              {copy.logOutEverywhere}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
