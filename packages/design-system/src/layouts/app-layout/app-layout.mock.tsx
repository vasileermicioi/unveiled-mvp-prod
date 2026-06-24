import type { ReactNode } from "react";
import type { AppLayoutProps } from "./app-layout.types";

export function makeMockAppLayoutProps(
  overrides: Partial<AppLayoutProps> = {},
): AppLayoutProps {
  const defaultHeader: ReactNode = (
    <div className="border-b-2 border-brand-dark bg-white p-4 text-[10px] font-black uppercase tracking-[0.18em]">
      Mock navigation header
    </div>
  );
  const defaultPageBody: ReactNode = (
    <div className="space-y-3 p-6 text-sm font-bold uppercase tracking-widest">
      <p>Mock page body</p>
      <p className="text-brand-dark/70">
        Replace with an organism from <code>@unveiled/design-system</code>.
      </p>
    </div>
  );
  return {
    header: defaultHeader,
    pageBody: defaultPageBody,
    ...overrides,
  };
}
