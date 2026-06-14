import type { Meta, StoryObj } from "@storybook/react";

interface VisualBaselineProps {
  caption: string;
}

function VisualBaseline({ caption }: VisualBaselineProps) {
  return (
    <div className="p-4 text-sm" data-testid="visual-baseline">
      {caption}
    </div>
  );
}

const meta: Meta<typeof VisualBaseline> = {
  title: "Smoke/VisualBaseline",
  component: VisualBaseline,
  parameters: {
    layout: "fullscreen",
    storybook: {
      skipCoverage: true,
    },
  },
  args: {
    caption: "Visual regression baseline",
  },
};

export default meta;
type Story = StoryObj<typeof VisualBaseline>;

export const Default: Story = {};
