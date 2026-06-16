// @ladle-only
/* biome-ignore-all lint/a11y/noRedundantRoles: the design-system-replica spec requires <main role="main"> for selector discipline. */
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineBadge } from "@/components/ui/mantine-replica/MantineBadge";
import { MantineButton } from "@/components/ui/mantine-replica/MantineButton";
import { MantineCard } from "@/components/ui/mantine-replica/MantineCard";
import { MantineDivider } from "@/components/ui/mantine-replica/MantineDivider";
import { MantineDrawer } from "@/components/ui/mantine-replica/MantineDrawer";
import { MantineField } from "@/components/ui/mantine-replica/MantineField";
import { MantineReplicaMenu } from "@/components/ui/mantine-replica/MantineMenu";
import { MantineModal } from "@/components/ui/mantine-replica/MantineModal";
import { MantineReplicaNotification } from "@/components/ui/mantine-replica/MantineNotification";
import { MantinePanel } from "@/components/ui/mantine-replica/MantinePanel";
import { MantineSelectInput } from "@/components/ui/mantine-replica/MantineSelectInput";
import { MantineStatePanel } from "@/components/ui/mantine-replica/MantineStatePanel";
import { MantineStatPanel } from "@/components/ui/mantine-replica/MantineStatPanel";
import { MantineTableRow } from "@/components/ui/mantine-replica/MantineTableRow";
import { MantineTableShell } from "@/components/ui/mantine-replica/MantineTableShell";
import { MantineReplicaTabs } from "@/components/ui/mantine-replica/MantineTabs";
import { MantineTextArea } from "@/components/ui/mantine-replica/MantineTextArea";
import { MantineTextInput } from "@/components/ui/mantine-replica/MantineTextInput";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

const SECTIONS: Array<{ id: string; label: string; element: React.ReactNode }> =
  [
    {
      id: "button",
      label: "Button",
      element: (
        <div className="flex flex-wrap gap-3">
          <MantineButton>Default</MantineButton>
          <MantineButton variant="primary">Primary</MantineButton>
          <MantineButton variant="secondary">Secondary</MantineButton>
          <MantineButton variant="yellow">Yellow</MantineButton>
          <MantineButton variant="active">Active</MantineButton>
          <MantineButton variant="destructive">Destructive</MantineButton>
          <MantineButton variant="outline">Outline</MantineButton>
          <MantineButton variant="muted">Muted</MantineButton>
        </div>
      ),
    },
    {
      id: "panel",
      label: "Panel",
      element: (
        <div className="grid gap-3 md:grid-cols-2">
          <MantinePanel tone="white">White</MantinePanel>
          <MantinePanel tone="yellow">Yellow</MantinePanel>
          <MantinePanel tone="cream">Cream</MantinePanel>
          <MantinePanel tone="grey">Grey</MantinePanel>
          <MantinePanel tone="dark">Dark</MantinePanel>
          <MantinePanel tone="white" shadow={false}>
            No shadow
          </MantinePanel>
        </div>
      ),
    },
    {
      id: "card",
      label: "Card",
      element: (
        <div className="grid gap-3 md:grid-cols-2">
          <MantineCard className="p-6">
            <h3 className="text-2xl font-black uppercase">Static</h3>
          </MantineCard>
          <MantineCard interactive className="cursor-pointer p-6">
            <h3 className="text-2xl font-black uppercase">Interactive</h3>
          </MantineCard>
        </div>
      ),
    },
    {
      id: "badge",
      label: "Badge",
      element: (
        <div className="flex flex-wrap gap-2">
          <MantineBadge tone="dark">Dark</MantineBadge>
          <MantineBadge tone="yellow">Yellow</MantineBadge>
          <MantineBadge tone="white">White</MantineBadge>
          <MantineBadge tone="grey">Grey</MantineBadge>
          <MantineBadge tone="success">Success</MantineBadge>
          <MantineBadge tone="error">Error</MantineBadge>
        </div>
      ),
    },
    {
      id: "text-input",
      label: "TextInput",
      element: (
        <div className="grid gap-3 md:grid-cols-2">
          <MantineTextInput label="Empty" placeholder="Type here" />
          <MantineTextInput label="Filled" defaultValue="Filled value" />
        </div>
      ),
    },
    {
      id: "select-input",
      label: "SelectInput",
      element: (
        <MantineSelectInput
          label="Pick a section"
          data={[
            { value: "discover", label: "Discover" },
            { value: "bookings", label: "Bookings" },
            { value: "profile", label: "Profile" },
          ]}
        />
      ),
    },
    {
      id: "text-area",
      label: "TextArea",
      element: (
        <MantineTextArea
          label="Notes"
          placeholder="Add notes"
          helper="Up to 500 characters"
        />
      ),
    },
    {
      id: "divider",
      label: "Divider",
      element: (
        <div className="grid gap-3">
          <p>Above the divider</p>
          <MantineDivider />
          <p>Below the divider</p>
        </div>
      ),
    },
    {
      id: "stat-panel",
      label: "StatPanel",
      element: (
        <div className="grid gap-3 md:grid-cols-2">
          <MantineStatPanel label="Tickets" value="1,284" />
          <MantineStatPanel
            label="Revenue"
            value="$12.4k"
            caption="Up 8% week over week"
          />
        </div>
      ),
    },
    {
      id: "field",
      label: "Field",
      element: (
        <div className="grid gap-4 md:grid-cols-2">
          <MantineField label="Email">
            <input
              className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
              placeholder="you@example.com"
            />
          </MantineField>
          <MantineField
            label="Handle"
            helper="Lowercase letters and digits only"
          >
            <input
              className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
              placeholder="@handle"
            />
          </MantineField>
        </div>
      ),
    },
    {
      id: "state-panel",
      label: "StatePanel",
      element: (
        <div className="grid gap-3 md:grid-cols-2">
          <MantineStatePanel
            title="Empty"
            text="Nothing to show"
            state="empty"
          />
          <MantineStatePanel
            title="Loading"
            text="One moment"
            state="loading"
          />
          <MantineStatePanel title="Error" text="Try again" state="error" />
          <MantineStatePanel title="Success" text="All set" state="success" />
        </div>
      ),
    },
    {
      id: "table-shell",
      label: "TableShell",
      element: (
        <MantineTableShell>
          <MantineTableRow>
            <span className="font-black uppercase">Event</span>
            <span>Sat 9 PM</span>
            <span>10/50</span>
            <span>Book</span>
          </MantineTableRow>
          <MantineTableRow>
            <span className="font-black uppercase">Show</span>
            <span>Sun 7 PM</span>
            <span>42/80</span>
            <span>Book</span>
          </MantineTableRow>
        </MantineTableShell>
      ),
    },
    {
      id: "modal",
      label: "Modal",
      element: (
        <MantineModal opened onClose={() => {}} title="Modal sample">
          <p>Modal body content</p>
        </MantineModal>
      ),
    },
    {
      id: "drawer",
      label: "Drawer",
      element: (
        <MantineDrawer opened onClose={() => {}} title="Drawer sample">
          <p>Drawer body content</p>
        </MantineDrawer>
      ),
    },
    {
      id: "tabs",
      label: "Tabs",
      element: (
        <MantineReplicaTabs
          defaultValue="overview"
          tabs={[
            { value: "overview", label: "Overview", content: <p>Overview</p> },
            { value: "details", label: "Details", content: <p>Details</p> },
          ]}
        />
      ),
    },
    {
      id: "menu",
      label: "Menu",
      element: (
        <MantineReplicaMenu
          triggerLabel="Open menu"
          items={[{ label: "Item 1" }, { label: "Item 2" }]}
        />
      ),
    },
    {
      id: "notification",
      label: "Notification",
      element: (
        <div className="flex flex-wrap gap-2">
          <MantineReplicaNotification
            tone="info"
            title="Info"
            message="Heads up"
          />
          <MantineReplicaNotification
            tone="success"
            title="Success"
            message="Done"
          />
          <MantineReplicaNotification
            tone="error"
            title="Error"
            message="Try again"
          />
          <MantineReplicaNotification
            tone="warning"
            title="Warning"
            message="Check this"
          />
        </div>
      ),
    },
  ];

export default {
  title: "Mantine Replica / Overview",
  decorators: [
    (StoryFn: () => React.ReactNode) => (
      <MantineReplicaProvider>
        <div className="bg-brand-grey p-6">
          <div className="unveiled-shadow border-4 border-brand-dark bg-white p-6">
            <StoryFn />
          </div>
        </div>
      </MantineReplicaProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    ladle: {
      skipCoverage: true,
    },
  },
};

function OverviewBody() {
  return (
    <div>
      <header className="unveiled-shadow mb-8 border-4 border-brand-dark bg-white p-6">
        <h1 className="headline-md">
          Unveiled Design System (Mantine replica)
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest opacity-60">
          Brand-faithful Mantine 9 rendering of every primitive in
          <code className="ml-1">src/components/ui/</code>
        </p>
      </header>
      <nav aria-label="Sections" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="border-4 border-brand-dark bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="unveiled-shadow border-4 border-brand-dark bg-white p-6"
          >
            <h2 className="unveiled-meta mb-4 text-base">{section.label}</h2>
            {section.element}
          </section>
        ))}
      </div>
    </div>
  );
}

export const DesignSystem: Story = () => (
  <main role="main" className="bg-brand-grey p-6">
    <OverviewBody />
  </main>
);
