// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineTextArea } from "@/components/ui/mantine-replica/MantineTextArea";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / TextArea",
  component: MantineTextArea,
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

export const Empty: Story = () => (
  <MantineTextArea label="Empty" placeholder="Add notes" />
);
export const Filled: Story = () => (
  <MantineTextArea label="Filled" defaultValue="Lorem ipsum" />
);
export const ErrorState: Story = () => (
  <MantineTextArea
    label="Error"
    defaultValue="oops"
    error="Add at least 20 characters"
  />
);
export const Helper: Story = () => (
  <MantineTextArea
    label="Helper"
    placeholder="Notes"
    helper="Up to 500 characters"
  />
);
export const Disabled: Story = () => (
  <MantineTextArea label="Disabled" placeholder="Disabled" disabled />
);
