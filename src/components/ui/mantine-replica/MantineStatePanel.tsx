// @ladle-only
import type * as React from "react";

import { MantinePanel } from "@/components/ui/mantine-replica/MantinePanel";

export interface MantineStatePanelProps {
  title: string;
  text: string;
  state?: "empty" | "loading" | "error" | "success";
  action?: React.ReactNode;
}

export function MantineStatePanel({
  title,
  text,
  state = "empty",
  action,
}: MantineStatePanelProps) {
  const tone =
    state === "error" ? "white" : state === "success" ? "yellow" : "cream";
  return (
    <MantinePanel
      tone={tone}
      shadow={false}
      className="grid min-h-44 place-items-center text-center"
    >
      <div className="max-w-md space-y-4">
        <p className="headline-md">{title}</p>
        <p className="text-sm font-bold uppercase tracking-widest opacity-60">
          {text}
        </p>
        {action}
      </div>
    </MantinePanel>
  );
}
