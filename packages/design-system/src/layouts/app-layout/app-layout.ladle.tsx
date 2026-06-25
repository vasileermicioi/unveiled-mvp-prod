import { AppLayout } from "./app-layout";
import { makeMockAppLayoutProps } from "./app-layout.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageBody: (
        <div className="p-6 text-sm font-bold uppercase tracking-widest">
          Mock page content
        </div>
      ),
    })}
  />
);

export const WithAside = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Page header
        </h1>
      ),
      pageBody: (
        <div className="p-6 text-sm font-bold uppercase tracking-widest">
          Main column
        </div>
      ),
      pageAside: (
        <div className="border-2 border-brand-dark p-4 text-[10px] font-black uppercase tracking-[0.18em]">
          Aside
        </div>
      ),
    })}
  />
);

export const SlotOnly = () => (
  <AppLayout>
    <div className="p-6 text-sm font-bold uppercase tracking-widest">
      Astro slot-only children
    </div>
  </AppLayout>
);

export default {
  title: "Layouts / App Layout",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
