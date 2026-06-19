// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { TextArea } from "@unveiled/design-system";

export const MultiLine: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <label className="text-[10px] font-black uppercase tracking-[0.18em]">
      Notes
      <TextArea defaultValue="Line one&#10;Line two" />
    </label>
  </div>
);

export const Disabled: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <label className="text-[10px] font-black uppercase tracking-[0.18em]">
      Internal notes
      <TextArea disabled defaultValue="Locked for editing" />
    </label>
  </div>
);

export default {
  title: "ui-system / TextArea",
};