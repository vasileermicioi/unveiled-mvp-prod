// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineReplicaTabs } from "@/components/ui/mantine-replica/MantineTabs";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

const TABS = [
  { value: "overview", label: "Overview", content: <p>Overview content</p> },
  { value: "details", label: "Details", content: <p>Details content</p> },
  { value: "reviews", label: "Reviews", content: <p>Reviews content</p> },
];

export default {
  title: "Mantine Replica / Tabs",
  component: MantineReplicaTabs,
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

export const Horizontal: Story = () => (
  <MantineReplicaTabs defaultValue="overview" tabs={TABS} />
);
export const Vertical: Story = () => (
  <MantineReplicaTabs
    defaultValue="overview"
    orientation="vertical"
    tabs={TABS}
  />
);
