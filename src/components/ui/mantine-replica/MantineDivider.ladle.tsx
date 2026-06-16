// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineDivider } from "@/components/ui/mantine-replica/MantineDivider";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / Divider",
  component: MantineDivider,
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

export const Default: Story = () => (
  <div className="grid gap-3">
    <p>Above</p>
    <MantineDivider />
    <p>Below</p>
  </div>
);
