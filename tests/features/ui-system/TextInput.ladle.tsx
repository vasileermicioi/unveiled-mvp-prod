// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { TextInput } from "@unveiled/design-system";

export const Disabled: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <label className="text-[10px] font-black uppercase tracking-[0.18em]">
      Display name
      <TextInput disabled defaultValue="Ada Lovelace" />
    </label>
  </div>
);

export default {
  title: "ui-system / TextInput",
};
