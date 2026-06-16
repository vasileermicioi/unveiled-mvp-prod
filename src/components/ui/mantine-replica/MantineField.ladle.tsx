// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineField } from "@/components/ui/mantine-replica/MantineField";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / Field",
  component: MantineField,
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
  <MantineField label="Email">
    <input
      className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
      placeholder="you@example.com"
    />
  </MantineField>
);
export const WithError: Story = () => (
  <MantineField label="Email" error="Enter a valid email">
    <input
      defaultValue="not-an-email"
      className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
    />
  </MantineField>
);
export const WithHelper: Story = () => (
  <MantineField label="Handle" helper="Lowercase letters and digits only">
    <input
      className="min-h-12 w-full border-4 border-brand-dark bg-white px-4 py-3 text-sm"
      placeholder="@handle"
    />
  </MantineField>
);
