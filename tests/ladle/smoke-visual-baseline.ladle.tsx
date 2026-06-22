import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
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

export default {
  component: VisualBaseline,
  parameters: {
    layout: "fullscreen",
    ladle: {
      skipCoverage: true,
    },
  },
};

export const Default: Story = () => (
  <VisualBaseline caption="Visual regression baseline" />
);
