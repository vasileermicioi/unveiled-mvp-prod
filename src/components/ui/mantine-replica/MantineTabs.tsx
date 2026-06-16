// @ladle-only
import { Tabs as MantineTabsBase } from "@mantine/core";
import type * as React from "react";

export type MantineTabsOrientation = "horizontal" | "vertical";

export interface MantineTabsProps {
  defaultValue: string;
  orientation?: MantineTabsOrientation;
  tabs: Array<{ value: string; label: string; content: React.ReactNode }>;
}

export function MantineReplicaTabs({
  defaultValue,
  orientation = "horizontal",
  tabs,
}: MantineTabsProps) {
  return (
    <MantineTabsBase
      defaultValue={defaultValue}
      orientation={orientation}
      variant="outline"
    >
      <MantineTabsBase.List>
        {tabs.map((tab) => (
          <MantineTabsBase.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </MantineTabsBase.Tab>
        ))}
      </MantineTabsBase.List>
      {tabs.map((tab) => (
        <MantineTabsBase.Panel key={tab.value} value={tab.value}>
          {tab.content}
        </MantineTabsBase.Panel>
      ))}
    </MantineTabsBase>
  );
}
