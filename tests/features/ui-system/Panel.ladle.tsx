// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { Panel } from "@/components/ui/unveiled-primitives";

export const ToneMatrix: Story = () => (
  <div className="grid gap-4 bg-brand-grey p-8">
    <Panel aria-label="Panel tone matrix" tone="white">
      <p>white tone</p>
    </Panel>
    <Panel aria-label="Panel tone matrix" tone="yellow">
      <p>yellow tone</p>
    </Panel>
    <Panel aria-label="Panel tone matrix" tone="cream">
      <p>cream tone</p>
    </Panel>
    <Panel aria-label="Panel tone matrix" tone="dark">
      <p>dark tone</p>
    </Panel>
    <Panel aria-label="Panel tone matrix" tone="grey">
      <p>grey tone</p>
    </Panel>
  </div>
);

export const ShadowToggle: Story = () => (
  <div className="grid gap-4 bg-brand-grey p-8">
    <Panel aria-label="Panel shadow off" tone="cream" shadow={false}>
      <p>shadow off</p>
    </Panel>
  </div>
);

export default {
  title: "ui-system / Panel",
};