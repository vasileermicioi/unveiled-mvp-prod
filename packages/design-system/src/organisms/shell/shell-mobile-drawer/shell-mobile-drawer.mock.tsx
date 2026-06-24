import type { ReactNode } from "react";
import type { ShellMobileDrawerProps } from "./shell-mobile-drawer";

const MockLogo = (): ReactNode => (
  <div className="grid h-7 w-32 place-items-center border-2 border-dashed border-brand-dark/40 text-[8px] font-black uppercase tracking-widest text-brand-dark/60">
    Logo
  </div>
);

const MockNavItems = (): ReactNode => (
  <>
    <a
      href="/app"
      className="w-full justify-start inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark"
    >
      Saved
    </a>
    <a
      href="/app/bookings"
      className="w-full justify-start inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark"
    >
      Bookings
    </a>
  </>
);

const MockFooter = (): ReactNode => (
  <button
    type="button"
    className="w-full justify-start inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-2 border-brand-dark bg-brand-dark px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white"
  >
    EN | DE
  </button>
);

// source: lucide-static
const CloseIcon = ({ className }: { className?: string }): ReactNode => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="3"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

export function makeMockShellMobileDrawerProps(
  overrides: Partial<ShellMobileDrawerProps> = {},
): ShellMobileDrawerProps {
  return {
    open: true,
    onClose: () => undefined,
    headingId: "shell-mobile-drawer-heading",
    menuHeading: "Menu",
    closeIcon: <CloseIcon className="size-5 md:size-6" />,
    logo: <MockLogo />,
    children: <MockNavItems />,
    footer: <MockFooter />,
    ...overrides,
  };
}
