// @ladle-only
import "@unveiled/app/styles/global.css";
import { HeroBadge } from "./HeroBadge";
import { HeroButton } from "./HeroButton";
import { HeroCard } from "./HeroCard";
import { HeroDivider } from "./HeroDivider";
import { HeroDrawer } from "./HeroDrawer";
import { HeroField } from "./HeroField";
import { HeroMenu, HeroMenuContent, HeroMenuTrigger } from "./HeroMenu";
import { HeroModal } from "./HeroModal";
import { HeroPanel } from "./HeroPanel";
import { HeroSelectInput, HeroSelectItem } from "./HeroSelectInput";
import { HeroStatePanel } from "./HeroStatePanel";
import { HeroStatPanel } from "./HeroStatPanel";
import { HeroTableRow, HeroTableShell } from "./HeroTableShell";
import { HeroTab, HeroTabs } from "./HeroTabs";
import { HeroTextArea } from "./HeroTextArea";
import { HeroTextInput } from "./HeroTextInput";
import { HeroToast } from "./HeroToast";
import { HeroUIReplicaProvider } from "./provider";

export const DesignSystemOverview = () => (
  <HeroUIReplicaProvider>
    <main role="main" className="min-h-screen bg-brand-yellow p-6 md:p-10">
      <h1 className="font-display text-4xl font-black uppercase md:text-6xl">
        Unveiled Design System (HeroUI)
      </h1>
      <nav className="mt-6 flex flex-wrap gap-3">
        <a
          href="#button"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Button
        </a>
        <a
          href="#badge"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Badge
        </a>
        <a
          href="#card"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Card
        </a>
        <a
          href="#panel"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Panel
        </a>
        <a
          href="#stat-panel"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          StatPanel
        </a>
        <a
          href="#field"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Field
        </a>
        <a
          href="#text-input"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          TextInput
        </a>
        <a
          href="#select-input"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          SelectInput
        </a>
        <a
          href="#text-area"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          TextArea
        </a>
        <a
          href="#divider"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Divider
        </a>
        <a
          href="#state-panel"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          StatePanel
        </a>
        <a
          href="#table-shell"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          TableShell
        </a>
        <a
          href="#modal"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Modal
        </a>
        <a
          href="#drawer"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Drawer
        </a>
        <a
          href="#tabs"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Tabs
        </a>
        <a
          href="#menu"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Menu
        </a>
        <a
          href="#toast"
          className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:opacity-60"
        >
          Toast
        </a>
      </nav>
      <div className="mt-10 grid gap-10">
        <section id="button" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Button</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroButton>Primary Button</HeroButton>
          </div>
        </section>
        <section id="badge" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Badge</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroBadge>Badge</HeroBadge>
          </div>
        </section>
        <section id="card" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Card</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroCard className="p-6">Card content</HeroCard>
          </div>
        </section>
        <section id="panel" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Panel</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroPanel>Panel content</HeroPanel>
          </div>
        </section>
        <section id="stat-panel" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            StatPanel
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroStatPanel label="Total" value="1,000" />
          </div>
        </section>
        <section id="field" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Field</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroField label="Label">Field children</HeroField>
          </div>
        </section>
        <section id="text-input" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            TextInput
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroTextInput placeholder="Placeholder" />
          </div>
        </section>
        <section id="select-input" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            SelectInput
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroSelectInput label="Choose">
              <HeroSelectItem key="a">Option A</HeroSelectItem>
              <HeroSelectItem key="b">Option B</HeroSelectItem>
            </HeroSelectInput>
          </div>
        </section>
        <section id="text-area" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            TextArea
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroTextArea placeholder="Text area" />
          </div>
        </section>
        <section id="divider" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            Divider
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroDivider />
          </div>
        </section>
        <section id="state-panel" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            StatePanel
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroStatePanel title="Empty" text="No data" />
          </div>
        </section>
        <section id="table-shell" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">
            TableShell
          </h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroTableShell>
              <HeroTableRow>Row</HeroTableRow>
            </HeroTableShell>
          </div>
        </section>
        <section id="modal" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Modal</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroModal isOpen={false}>Modal content</HeroModal>
          </div>
        </section>
        <section id="drawer" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Drawer</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroDrawer isOpen={false}>Drawer content</HeroDrawer>
          </div>
        </section>
        <section id="tabs" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Tabs</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroTabs>
              <HeroTab key="a" title="Tab">
                Content
              </HeroTab>
            </HeroTabs>
          </div>
        </section>
        <section id="menu" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Menu</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroMenu>
              <HeroMenuTrigger>
                <HeroButton variant="bordered">Open Menu</HeroButton>
              </HeroMenuTrigger>
              <HeroMenuContent>
                <ul className="min-w-[140px] space-y-1">
                  <li className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-brand-yellow">
                    Edit
                  </li>
                  <li className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-brand-yellow">
                    Duplicate
                  </li>
                  <li className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-brand-error hover:text-white">
                    Delete
                  </li>
                </ul>
              </HeroMenuContent>
            </HeroMenu>
          </div>
        </section>
        <section id="toast" className="scroll-mt-10">
          <h2 className="font-display text-2xl font-black uppercase">Toast</h2>
          <div className="mt-4 bg-brand-grey p-6 unveiled-shadow">
            <HeroToast title="Toast" description="Message" />
          </div>
        </section>
      </div>
    </main>
  </HeroUIReplicaProvider>
);

export default {
  title: "HeroUI / Design System Overview",
  parameters: { ladle: { skipCoverage: true } },
};
