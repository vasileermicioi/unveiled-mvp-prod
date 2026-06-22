// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { SelectInput } from "@unveiled/design-system";

export const SelectionChange: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <label className="text-[10px] font-black uppercase tracking-[0.18em]">
      City
      <SelectInput defaultValue="berlin">
        <option value="berlin">Berlin</option>
        <option value="hamburg">Hamburg</option>
        <option value="munich">Munich</option>
      </SelectInput>
    </label>
  </div>
);

export const Disabled: Story = () => (
  <div className="grid max-w-md gap-2 bg-brand-grey p-8">
    <label className="text-[10px] font-black uppercase tracking-[0.18em]">
      Category
      <SelectInput disabled defaultValue="music">
        <option value="music">Music</option>
        <option value="film">Film</option>
      </SelectInput>
    </label>
  </div>
);

export default {
  title: "ui-system / SelectInput",
};
