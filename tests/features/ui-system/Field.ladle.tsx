// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { Field } from "@unveiled/design-system";

export const LabelWithHint: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <Field label="Display name" helper="Visible on your tickets">
      <input id="display-name" defaultValue="" />
    </Field>
  </div>
);

export const LabelWithError: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <Field label="Email address" error="Enter a valid email">
      <input id="email-address" defaultValue="not-an-email" />
    </Field>
  </div>
);

export default {
  title: "ui-system / Field",
};
