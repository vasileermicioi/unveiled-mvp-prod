// @ladle-only
import { Divider as MantineDividerBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineDividerProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function MantineDivider({ className, ...props }: MantineDividerProps) {
  return (
    <MantineDividerBase
      color="brandDark"
      size={4}
      className={cn("unveiled-mantine-divider", className)}
      {...(props as React.ComponentProps<typeof MantineDividerBase>)}
    />
  );
}
