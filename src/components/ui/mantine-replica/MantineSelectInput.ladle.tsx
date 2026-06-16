// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import { MantineSelectInput } from "@/components/ui/mantine-replica/MantineSelectInput";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

const data = [
  { value: "discover", label: "Discover" },
  { value: "bookings", label: "Bookings" },
  { value: "profile", label: "Profile" },
];

export default {
  title: "Mantine Replica / SelectInput",
  component: MantineSelectInput,
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

export const Closed: Story = () => (
  <MantineSelectInput label="Closed" data={data} placeholder="Pick one" />
);
export const Open: Story = () => (
  <MantineSelectInput label="Open" data={data} defaultValue="discover" />
);
export const Selected: Story = () => (
  <MantineSelectInput label="Selected" data={data} defaultValue="bookings" />
);
export const Disabled: Story = () => (
  <MantineSelectInput label="Disabled" data={data} disabled />
);
export const WithError: Story = () => (
  <MantineSelectInput label="With error" data={data} error="Pick a section" />
);
export const WithHelper: Story = () => (
  <MantineSelectInput
    label="With helper"
    data={data}
    helper="Pick the one you want to navigate to"
  />
);
