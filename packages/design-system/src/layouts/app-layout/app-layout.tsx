import type { ReactNode } from "react";
import { AppShellPresentational } from "../../organisms/shell/app-shell";
import type { AppLayoutProps } from "./app-layout.types";

export type { AppLayoutProps } from "./app-layout.types";

export function AppLayout({
  header,
  pageHeader,
  pageBody,
  pageAside,
}: AppLayoutProps): ReactNode {
  if (!header) {
    return (
      <div className="space-y-6">
        {pageHeader ? <div className="space-y-2">{pageHeader}</div> : null}
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="min-w-0">{pageBody}</div>
          {pageAside ? <aside className="space-y-4">{pageAside}</aside> : null}
        </div>
      </div>
    );
  }
  return (
    <AppShellPresentational header={header}>
      <div className="space-y-6">
        {pageHeader ? <div className="space-y-2">{pageHeader}</div> : null}
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="min-w-0">{pageBody}</div>
          {pageAside ? <aside className="space-y-4">{pageAside}</aside> : null}
        </div>
      </div>
    </AppShellPresentational>
  );
}
