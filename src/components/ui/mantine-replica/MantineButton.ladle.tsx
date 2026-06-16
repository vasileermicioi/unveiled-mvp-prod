// @ladle-only
import type { Story } from "@ladle/react";
import {
  MantineButton,
  type MantineButtonSize,
  type MantineButtonVariant,
} from "@/components/ui/mantine-replica/MantineButton";
import { MantineReplicaProvider } from "@/components/ui/mantine-replica/provider";

const VARIANTS: MantineButtonVariant[] = [
  "default",
  "primary",
  "secondary",
  "yellow",
  "active",
  "copied",
  "destructive",
  "ghost",
  "outline",
  "muted",
  "link",
];

const SIZES: MantineButtonSize[] = ["default", "sm", "lg", "icon", "icon-sm"];

function Surface({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-3 bg-brand-grey p-6">
      <span className="unveiled-meta opacity-50">{label}</span>
      <div className="unveiled-shadow border-4 border-brand-dark bg-white p-6">
        {children}
      </div>
    </div>
  );
}

export default {
  title: "Mantine Replica / Button",
  component: MantineButton,
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

export const Default: Story = () => <MantineButton>Default</MantineButton>;
export const Primary: Story = () => (
  <MantineButton variant="primary">Primary</MantineButton>
);
export const Secondary: Story = () => (
  <MantineButton variant="secondary">Secondary</MantineButton>
);
export const Yellow: Story = () => (
  <MantineButton variant="yellow">Yellow</MantineButton>
);
export const Active: Story = () => (
  <MantineButton variant="active">Active</MantineButton>
);
export const Copied: Story = () => (
  <MantineButton variant="copied">Copied</MantineButton>
);
export const Destructive: Story = () => (
  <MantineButton variant="destructive">Destructive</MantineButton>
);
export const Ghost: Story = () => (
  <MantineButton variant="ghost">Ghost</MantineButton>
);
export const Outline: Story = () => (
  <MantineButton variant="outline">Outline</MantineButton>
);
export const Muted: Story = () => (
  <MantineButton variant="muted">Muted</MantineButton>
);
export const Link: Story = () => (
  <MantineButton variant="link">Link</MantineButton>
);
export const Loading: Story = () => (
  <MantineButton loading>Loading</MantineButton>
);
export const Disabled: Story = () => (
  <MantineButton disabled>Disabled</MantineButton>
);
export const AsChild: Story = () => (
  <MantineButton asChild>
    <a href="#ladle">Anchored</a>
  </MantineButton>
);

export const SizeMatrix: Story = () => (
  <Surface label="size matrix">
    <div className="flex flex-wrap gap-3">
      {SIZES.map((size) => (
        <MantineButton key={size} size={size} variant="default">
          {size}
        </MantineButton>
      ))}
    </div>
  </Surface>
);

export const VariantMatrix: Story = () => (
  <Surface label="variant matrix">
    <div className="flex flex-wrap gap-3">
      {VARIANTS.map((variant) => (
        <MantineButton key={variant} variant={variant}>
          {variant}
        </MantineButton>
      ))}
    </div>
  </Surface>
);
