// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineTextInput } from "@/components/ui/mantine-replica/MantineTextInput";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / TextInput",
  component: MantineTextInput,
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
  <MantineTextInput label="Empty" placeholder="Type here" />
);
export const Filled: Story = () => (
  <MantineTextInput label="Filled" defaultValue="Hello, world" />
);
export const ErrorState: Story = () => (
  <MantineTextInput label="Error" defaultValue="oops" error="Required field" />
);
export const Helper: Story = () => (
  <MantineTextInput
    label="Helper"
    placeholder="With helper"
    helper="Up to 60 characters"
  />
);
export const Disabled: Story = () => (
  <MantineTextInput label="Disabled" placeholder="Disabled" disabled />
);
