// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { Card } from "@unveiled/design-system";

export const DefaultCard: Story = () => (
  <div className="grid gap-4 bg-brand-grey p-8">
    <Card aria-label="Card body">
      <p>Card body content</p>
    </Card>
  </div>
);

export const InteractiveCard: Story = () => (
  <div className="grid gap-4 bg-brand-grey p-8">
    <Card aria-label="Interactive card" interactive>
      <p>Interactive card content</p>
    </Card>
  </div>
);

export default {
  title: "ui-system / Card",
};
