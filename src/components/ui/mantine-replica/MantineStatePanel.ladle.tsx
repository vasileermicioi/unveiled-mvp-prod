// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineStatePanel } from "@/components/ui/mantine-replica/MantineStatePanel";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / StatePanel",
  component: MantineStatePanel,
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
  <MantineStatePanel
    title="No events yet"
    text="Check back soon"
    state="empty"
  />
);
export const Loading: Story = () => (
  <MantineStatePanel
    title="Loading"
    text="Fetching the latest"
    state="loading"
  />
);
export const ErrorState: Story = () => (
  <MantineStatePanel
    title="Something went wrong"
    text="Please retry"
    state="error"
  />
);
export const Success: Story = () => (
  <MantineStatePanel
    title="All set"
    text="Your booking is confirmed"
    state="success"
  />
);
