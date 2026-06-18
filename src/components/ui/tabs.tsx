import { Tab, Tabs as HeroUITabs } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type TabsProps = React.ComponentProps<typeof HeroUITabs> & {
  className?: string;
};

export function Tabs({ className, ...props }: TabsProps) {
  return (
    <HeroUITabs
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

export { Tab };
