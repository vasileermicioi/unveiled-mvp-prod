// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { Badge } from "@unveiled/design-system";

export const ToneMatrix: Story = () => (
  <div className="flex flex-wrap items-center gap-4 bg-brand-grey p-8">
    <section aria-label="Badge tone matrix" className="contents">
      <Badge tone="dark">dark</Badge>
      <Badge tone="yellow">yellow</Badge>
      <Badge tone="white">white</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="error">error</Badge>
    </section>
  </div>
);

export const CountAdjacentLabel: Story = () => (
  <div className="flex flex-wrap items-center gap-4 bg-brand-grey p-8">
    <section aria-label="Badge count label" className="contents">
      <Badge aria-label="Saved: 3">3</Badge>
    </section>
  </div>
);

export default {
  title: "ui-system / Badge",
};
