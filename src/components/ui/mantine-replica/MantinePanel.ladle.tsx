// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantinePanel } from "@/components/ui/mantine-replica/MantinePanel";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / Panel",
  component: MantinePanel,
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

export const White: Story = () => (
  <MantinePanel tone="white">White tone</MantinePanel>
);
export const Yellow: Story = () => (
  <MantinePanel tone="yellow">Yellow tone</MantinePanel>
);
export const Cream: Story = () => (
  <MantinePanel tone="cream">Cream tone</MantinePanel>
);
export const Grey: Story = () => (
  <MantinePanel tone="grey">Grey tone</MantinePanel>
);
export const Dark: Story = () => (
  <MantinePanel tone="dark">Dark tone</MantinePanel>
);
export const WithShadow: Story = () => (
  <MantinePanel tone="white" shadow>
    Shadowed panel
  </MantinePanel>
);
export const WithoutShadow: Story = () => (
  <MantinePanel tone="white" shadow={false}>
    Flat panel
  </MantinePanel>
);
export const AsForm: Story = () => (
  <MantinePanel as="form" tone="white" onSubmit={(e) => e.preventDefault()}>
    <label htmlFor="panel-form-input" className="unveiled-meta">
      A label
    </label>
    <input
      id="panel-form-input"
      className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
      placeholder="Form inside a panel"
    />
  </MantinePanel>
);
