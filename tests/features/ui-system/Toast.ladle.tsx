// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { Toast } from "@/components/ui/toast";

export const SuccessTone: Story = () => (
  <div className="grid gap-4 bg-brand-grey p-8">
    <Toast title="Saved" tone="success" />
  </div>
);

export const ErrorTone: Story = () => (
  <div className="grid gap-4 bg-brand-grey p-8">
    <Toast title="Booking failed" tone="danger" />
  </div>
);

export default {
  title: "ui-system / Toast",
};