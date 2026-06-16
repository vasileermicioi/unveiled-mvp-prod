// @ladle-only
import { Card as MantineCardBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export interface MantineCardProps extends React.HTMLAttributes<HTMLElement> {
  interactive?: boolean;
  className?: string;
}

export function MantineCard({
  interactive = false,
  className,
  style,
  children,
  ...props
}: MantineCardProps) {
  const composedStyle: React.CSSProperties = {
    backgroundColor: "var(--brand-white)",
    color: "var(--brand-dark)",
    border: "4px solid var(--brand-dark)",
    ...style,
  };
  return (
    <MantineCardBase
      className={cn(
        "unveiled-mantine-card-root",
        interactive && "unveiled-mantine-card-interactive",
        className,
      )}
      style={composedStyle}
      {...(props as React.ComponentProps<typeof MantineCardBase>)}
    >
      {children}
    </MantineCardBase>
  );
}
