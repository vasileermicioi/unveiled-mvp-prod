// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineReplicaMenu } from "@/components/ui/mantine-replica/MantineMenu";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

const FLAT_ITEMS = [
  { label: "Profile" },
  { label: "Settings" },
  { label: "Sign out" },
];

const NESTED_ITEMS = [
  { label: "Account" },
  {
    label: "Filters",
    children: [{ label: "Active" }, { label: "Archived" }, { label: "All" }],
  },
  { label: "Help" },
];

export default {
  title: "Mantine Replica / Menu",
  component: MantineReplicaMenu,
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

export const Closed: Story = () => (
  <MantineReplicaMenu triggerLabel="Open menu" items={FLAT_ITEMS} />
);
export const Open: Story = () => (
  <MantineReplicaMenu triggerLabel="Flat menu" items={FLAT_ITEMS} />
);
export const Nested: Story = () => (
  <MantineReplicaMenu triggerLabel="Nested menu" items={NESTED_ITEMS} />
);
