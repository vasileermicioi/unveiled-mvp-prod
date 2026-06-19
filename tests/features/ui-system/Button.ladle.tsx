// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { Button } from "@/components/ui/button";

export const VariantMatrix: Story = () => (
  <div className="flex flex-wrap gap-4 bg-brand-grey p-8">
    <Button variant="default">Primary default</Button>
    <Button variant="primary">Primary primary</Button>
    <Button variant="secondary">Primary secondary</Button>
    <Button variant="yellow">Primary yellow</Button>
    <Button variant="destructive">Primary destructive</Button>
  </div>
);

export const SizeMatrix: Story = () => (
  <div className="flex flex-wrap items-center gap-4 bg-brand-grey p-8">
    <Button size="default">Size default</Button>
    <Button size="sm">Size sm</Button>
    <Button size="lg">Size lg</Button>
  </div>
);

export const LoadingState: Story = () => (
  <div className="flex flex-wrap gap-4 bg-brand-grey p-8">
    <Button loading>Submit booking</Button>
  </div>
);

export const AsChildSlot: Story = () => (
  <div className="flex flex-wrap gap-4 bg-brand-grey p-8">
    <Button asChild>
      <a href="/en/discover">Open discovery</a>
    </Button>
  </div>
);

export const FocusRing: Story = () => (
  <div className="flex flex-wrap gap-4 bg-brand-grey p-8">
    <Button autoFocus>Primary default</Button>
  </div>
);

export default {
  title: "ui-system / Button",
};