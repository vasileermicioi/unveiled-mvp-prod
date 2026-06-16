// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineReplicaNotification } from "@/components/ui/mantine-replica/MantineNotification";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

export default {
  title: "Mantine Replica / Notification",
  component: MantineReplicaNotification,
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

export const Info: Story = () => (
  <MantineReplicaNotification
    tone="info"
    title="Heads up"
    message="New events are available"
  />
);
export const Success: Story = () => (
  <MantineReplicaNotification
    tone="success"
    title="Booked"
    message="Your seat is confirmed"
  />
);
export const ErrorState: Story = () => (
  <MantineReplicaNotification
    tone="error"
    title="Payment failed"
    message="Try a different card"
  />
);
export const Warning: Story = () => (
  <MantineReplicaNotification
    tone="warning"
    title="Almost full"
    message="Only a few seats remain"
  />
);
