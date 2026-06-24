import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

export interface ShellMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  headingId: string;
  menuHeading: string;
  closeIcon: ReactNode;
  logo: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function ShellMobileDrawerPresentational({
  open,
  onClose,
  headingId,
  menuHeading,
  closeIcon,
  logo,
  children,
  footer,
}: ShellMobileDrawerProps) {
  return (
    <>
      {open ? (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss
        <div
          className="fixed inset-0 z-[100] bg-brand-dark/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <div
        id="shell-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={cn(
          "fixed inset-y-0 right-0 z-[101] w-80 max-w-full bg-white border-l-4 border-brand-dark p-6 transition-transform duration-300 ease-in-out transform lg:hidden flex flex-col justify-between",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-7 w-auto">{logo}</div>
            <button
              type="button"
              className="flex items-center justify-center size-9 md:size-10 border-2 border-brand-dark bg-white hover:bg-brand-cream transition-colors text-brand-dark"
              onClick={onClose}
              aria-label="Close menu"
            >
              {closeIcon}
            </button>
          </div>

          <h2 id={headingId} className="sr-only">
            {menuHeading}
          </h2>

          <nav className="flex flex-col gap-2">{children}</nav>
        </div>

        {footer ? (
          <div className="space-y-6 border-t-2 border-brand-dark/20 pt-6">
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
}
