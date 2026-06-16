// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineStatPanel } from "@/components/ui/mantine-replica/MantineStatPanel";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / StatPanel",
  component: MantineStatPanel,
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
  <MantineStatPanel label="Tickets sold" value="1,284" />
);
export const WithCaption: Story = () => (
  <MantineStatPanel
    label="Tickets sold"
    value="1,284"
    caption="Up 12% week over week"
  />
);
