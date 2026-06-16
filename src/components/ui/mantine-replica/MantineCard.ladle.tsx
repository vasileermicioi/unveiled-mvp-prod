// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineCard } from "@/components/ui/mantine-replica/MantineCard";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / Card",
  component: MantineCard,
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

export const Static: Story = () => (
  <MantineCard className="p-6">
    <h3 className="text-2xl font-black uppercase">Static card</h3>
    <p className="mt-2 text-sm opacity-70">Use for flat content surfaces.</p>
  </MantineCard>
);
export const Interactive: Story = () => (
  <MantineCard interactive className="cursor-pointer p-6">
    <h3 className="text-2xl font-black uppercase">Interactive card</h3>
    <p className="mt-2 text-sm opacity-70">Hover for the offset shadow.</p>
  </MantineCard>
);
