// @ladle-only
import { Select, SelectItem } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroSelectInputProps = React.ComponentProps<typeof Select>;

export function HeroSelectInput({
  className,
  children,
  ...props
}: HeroSelectInputProps) {
  return (
    <Select
      classNames={{
        trigger: cn(
          "min-h-0 rounded-none border-4 border-brand-dark bg-white px-4 pt-7 pb-3 text-sm font-black uppercase tracking-widest focus-within:bg-brand-cream focus-within:ring-4 focus-within:ring-brand-dark/15 disabled:bg-brand-grey disabled:opacity-50",
          className,
        ),
        value: "pt-1 text-sm font-black uppercase tracking-widest",
        label:
          "top-1 start-4 text-[10px] font-black uppercase tracking-widest text-brand-dark",
        popoverContent:
          "rounded-none border-4 border-brand-dark bg-white p-0 unveiled-shadow before:hidden",
        listbox: "p-0 gap-0",
        listboxWrapper: "p-0",
        base: "min-h-0",
      }}
      listboxProps={{
        itemClasses: {
          base: "rounded-none px-4 py-3 text-sm font-black uppercase tracking-widest gap-3 data-[hover=true]:bg-brand-yellow data-[selectable=true]:focus:bg-brand-yellow data-[focus-visible=true]:outline-none",
          selectedIcon: "text-brand-dark",
          wrapper: "text-sm font-black uppercase tracking-widest",
        },
      }}
      variant="flat"
      {...props}
    >
      {children}
    </Select>
  );
}

export { SelectItem as HeroSelectItem };
