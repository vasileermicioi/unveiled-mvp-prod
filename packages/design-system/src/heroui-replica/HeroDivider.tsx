// @ladle-only
import { Divider } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroDividerProps = React.ComponentProps<typeof Divider>;

export function HeroDivider({ className, ...props }: HeroDividerProps) {
  return (
    <Divider
      className={cn("h-1 rounded-none bg-brand-dark", className)}
      {...props}
    />
  );
}
