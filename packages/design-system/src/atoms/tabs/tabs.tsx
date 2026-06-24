import { Tabs as HeroUITabs, Tab } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";
import "../../styles/atom-chrome.css";

export type TabsProps = React.ComponentProps<typeof HeroUITabs> & {
  className?: string;
};

export function Tabs({ className, ...props }: TabsProps) {
  return (
    <HeroUITabs
      classNames={{
        base: cn("unveiled-tab-base rounded-none", className),
        tabList: "unveiled-tab-list",
        tab: "unveiled-tab",
        tabContent: "unveiled-tab-content",
        cursor: "unveiled-tab-cursor",
        panel: "unveiled-tab-panel",
      }}
      {...props}
    />
  );
}

export { Tab };
