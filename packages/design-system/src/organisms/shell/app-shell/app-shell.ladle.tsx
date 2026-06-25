import type { ReactNode } from "react";
import { ShellIconButtonPresentational } from "../shell-icon-button/shell-icon-button";
import { AppShellPresentational } from "./app-shell";
import { makeMockAppShellProps } from "./app-shell.mock";

// source: lucide-static
const HamburgerIcon = () => (
  <svg
    aria-hidden="true"
    className="size-5 md:size-6"
    fill="none"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="3"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

function mockShellNavigationHeader(): ReactNode {
  return (
    <div className="flex items-center justify-between border-b-2 border-brand-dark bg-white p-4 text-[10px] font-black uppercase tracking-[0.18em]">
      <span>Mock brand</span>
      <ShellIconButtonPresentational
        aria-label="Open navigation menu"
        aria-controls="shell-mobile-drawer"
        aria-expanded={false}
      >
        <HamburgerIcon />
      </ShellIconButtonPresentational>
    </div>
  );
}

export const Default = () => (
  <AppShellPresentational {...makeMockAppShellProps()} />
);

export const Collapsed = () => (
  <AppShellPresentational
    {...makeMockAppShellProps({
      header: (
        <div className="border-b-2 border-brand-dark bg-brand-cream p-2 text-[8px] font-black uppercase tracking-[0.18em]">
          Collapsed mock header
        </div>
      ),
    })}
  />
);

export const WithDrawerOpen = () => (
  <AppShellPresentational
    {...makeMockAppShellProps({
      header: (
        <div className="border-b-2 border-brand-dark bg-brand-dark p-2 text-[8px] font-black uppercase tracking-[0.18em] text-white">
          Mock header with mobile drawer open
        </div>
      ),
      children: (
        <div className="p-6 text-sm font-bold uppercase tracking-widest opacity-60">
          Mock page (drawer overlay would render in real ShellNavigation)
        </div>
      ),
    })}
  />
);

export const LgViewport = () => (
  <AppShellPresentational
    {...makeMockAppShellProps({
      header: mockShellNavigationHeader(),
    })}
  />
);

export const SmViewport = () => (
  <AppShellPresentational
    {...makeMockAppShellProps({
      header: mockShellNavigationHeader(),
    })}
  />
);

LgViewport.parameters = {
  layout: "fullscreen",
  viewport: { defaultViewport: "desktop" },
};

SmViewport.parameters = {
  layout: "fullscreen",
  viewport: { defaultViewport: "mobile" },
};

export default {
  title: "Organisms / Shell / App Shell",
  parameters: { ladle: { skipCoverage: true } },
};
