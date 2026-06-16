import type { Story } from "@ladle/react";

import "@/styles/global.css";
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

export default {
  component: SmokeButton,
  parameters: {
    layout: "fullscreen",
    ladle: {
      skipCoverage: true,
    },
  },
};

export const Default: Story = () => <SmokeButton label="Run smoke" />;
