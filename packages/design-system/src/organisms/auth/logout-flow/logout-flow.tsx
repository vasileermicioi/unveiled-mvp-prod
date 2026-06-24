import type { ReactElement } from "react";
import { Button } from "../../../atoms";

export interface LogoutFlowCopy {
  trigger: string;
  menuLabel: string;
  profile: string;
  logOut: string;
  logOutEverywhere: string;
}

export interface LogoutFlowPresentationalProps {
  copy: LogoutFlowCopy;
  open: boolean;
  formId: string;
  onToggle: () => void;
  onOpenProfile?: () => void;
  onLogOut?: () => void;
  onLogOutEverywhere?: () => void;
}

export function LogoutFlowPresentational(
  props: LogoutFlowPresentationalProps,
): ReactElement {
  const {
    copy,
    open,
    formId,
    onToggle,
    onOpenProfile,
    onLogOut,
    onLogOutEverywhere,
  } = props;
  const menuId = `${formId}-menu`;
  return (
    <div className="relative inline-block">
      <Button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
      >
        {copy.trigger}
      </Button>
      {open ? (
        <ul
          id={menuId}
          aria-label={copy.menuLabel}
          className="absolute right-0 z-10 mt-2 grid w-56 gap-1 border-4 border-brand-dark bg-white p-1"
        >
          <li role="none">
            <button
              role="menuitem"
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-bold"
              onClick={() => onOpenProfile?.()}
            >
              {copy.profile}
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-bold"
              onClick={() => onLogOut?.()}
            >
              {copy.logOut}
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-bold"
              onClick={() => onLogOutEverywhere?.()}
            >
              {copy.logOutEverywhere}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
