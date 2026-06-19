// @ladle-only
import { Tab, Tabs } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroTabsProps = React.ComponentProps<typeof Tabs>;

export function HeroTabs({ className, ...props }: HeroTabsProps) {
  return (
    <Tabs
      classNames={{
        base: cn("rounded-none", className),
        tab: "rounded-none border-2 border-brand-dark bg-white text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark data-[selected=true]:bg-brand-dark data-[selected=true]:text-white",
        cursor: "rounded-none bg-brand-dark",
        panel: "border-4 border-brand-dark bg-white p-5 md:p-8 unveiled-shadow",
      }}
      {...props}
    />
  );
}

export { Tab as HeroTab };
