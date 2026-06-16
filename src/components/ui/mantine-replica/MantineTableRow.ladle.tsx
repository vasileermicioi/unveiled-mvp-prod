// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineTableRow } from "@/components/ui/mantine-replica/MantineTableRow";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / TableRow",
  component: MantineTableRow,
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
  <MantineTableRow>
    <span className="font-black uppercase">Event</span>
    <span>Sat 9 PM</span>
    <span>10/50</span>
    <button
      type="button"
      className="border-4 border-brand-dark bg-brand-dark px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
    >
      Book
    </button>
  </MantineTableRow>
);
