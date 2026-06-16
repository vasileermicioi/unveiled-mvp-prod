// @ladle-only
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineTableRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function MantineTableRow({
  children,
  className,
  ...props
}: MantineTableRowProps) {
  return (
    <div
      className={cn(
        "grid gap-3 border-b-2 border-brand-dark/20 p-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
