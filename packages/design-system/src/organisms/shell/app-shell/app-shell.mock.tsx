import type { AppShellProps } from "./app-shell";

export function makeMockAppShellProps(
  overrides: Partial<AppShellProps> = {},
): AppShellProps {
  return {
    header: (
      <div className="border-b-2 border-brand-dark bg-white p-4 text-[10px] font-black uppercase tracking-[0.18em]">
        Mock header (ShellNavigation)
      </div>
    ),
    children: (
      <div className="p-6 text-sm font-bold uppercase tracking-widest">
        Mock page content
      </div>
    ),
    ...overrides,
  };
}
