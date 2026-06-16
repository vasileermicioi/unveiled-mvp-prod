// @ladle-only
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineTableShellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function MantineTableShell({
  children,
  className,
  ...props
}: MantineTableShellProps) {
  return (
    <div
      className={cn(
        "overflow-hidden border-4 border-brand-dark bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
