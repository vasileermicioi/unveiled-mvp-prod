import type { ReactNode } from "react";

export interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
}

export function AppShellPresentational({ header, children }: AppShellProps) {
  return (
    <div className="page-shell min-h-screen text-brand-dark selection:bg-brand-dark selection:text-brand-yellow">
      {header}
      <main className="content-shell space-y-6 pb-16">{children}</main>
    </div>
  );
}
