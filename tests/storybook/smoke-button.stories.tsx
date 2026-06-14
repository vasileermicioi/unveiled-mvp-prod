import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

interface SmokeButtonProps {
  label: string;
  onClick?: () => void;
}

function SmokeButton({ label, onClick }: SmokeButtonProps) {
  return (
    <button type="button" onClick={onClick} className="px-3 py-2 rounded">
      {label}
    </button>
  );
}

const meta: Meta<typeof SmokeButton> = {
  title: "Smoke/Button",
  component: SmokeButton,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    label: "Run smoke",
  },
};

export default meta;
type Story = StoryObj<typeof SmokeButton>;

export const Default: Story = {
  name: "Default",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Run smoke" });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
  },
};
