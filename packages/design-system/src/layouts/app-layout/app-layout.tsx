import type { ReactNode } from "react";
import { AppShellPresentational } from "../../organisms/shell/app-shell";
import type { AppLayoutProps } from "./app-layout.types";

export type { AppLayoutProps } from "./app-layout.types";

export function AppLayout({
  header,
  pageHeader,
  pageBody,
  pageAside,
  children,
}: AppLayoutProps): ReactNode {
  const usesExplicitSlots =
    pageHeader !== undefined ||
    pageBody !== undefined ||
    pageAside !== undefined;

  if (!header && !usesExplicitSlots) {
    return children ?? null;
  }

  const body = pageBody ?? children;

  const content = (
    <div className="space-y-6">
      {pageHeader ? <div className="space-y-2">{pageHeader}</div> : null}
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="min-w-0">{body}</div>
        {pageAside ? <aside className="space-y-4">{pageAside}</aside> : null}
      </div>
    </div>
  );

  if (!header) {
    return content;
  }

  return (
    <AppShellPresentational header={header}>{content}</AppShellPresentational>
  );
}
