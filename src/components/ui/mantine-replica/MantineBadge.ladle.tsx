// @ladle-only
import type { Story } from "@ladle/react";
import type * as React from "react";
import {
  MantineBadge,
  type MantineBadgeTone,
} from "@/components/ui/mantine-replica/MantineBadge";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

const TONES: MantineBadgeTone[] = [
  "dark",
  "yellow",
  "white",
  "grey",
  "success",
  "error",
];

export default {
  title: "Mantine Replica / Badge",
  component: MantineBadge,
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

export const ToneMatrix: Story = () => (
  <div className="flex flex-wrap gap-2">
    {TONES.map((tone) => (
      <MantineBadge key={tone} tone={tone}>
        {tone}
      </MantineBadge>
    ))}
  </div>
);

export const Dark: Story = () => <MantineBadge tone="dark">Dark</MantineBadge>;
export const Yellow: Story = () => (
  <MantineBadge tone="yellow">Yellow</MantineBadge>
);
export const White: Story = () => (
  <MantineBadge tone="white">White</MantineBadge>
);
export const Grey: Story = () => <MantineBadge tone="grey">Grey</MantineBadge>;
export const Success: Story = () => (
  <MantineBadge tone="success">Success</MantineBadge>
);
export const ErrorState: Story = () => (
  <MantineBadge tone="error">Error</MantineBadge>
);
