import { AppShellPresentational } from "./app-shell";
import { makeMockAppShellProps } from "./app-shell.mock";

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

export default {
  title: "Organisms / Shell / App Shell",
  parameters: { ladle: { skipCoverage: true } },
};
