// @ladle-only
import { Paper as MantinePaperBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export type MantinePanelTone = "white" | "yellow" | "cream" | "grey" | "dark";

const TONE_BG: Record<MantinePanelTone, string> = {
  white: "var(--brand-white)",
  yellow: "var(--brand-yellow)",
  cream: "var(--brand-cream)",
  grey: "var(--brand-grey)",
  dark: "var(--brand-dark)",
};

const TONE_FG: Record<MantinePanelTone, string> = {
  white: "var(--brand-dark)",
  yellow: "var(--brand-dark)",
  cream: "var(--brand-dark)",
  grey: "var(--brand-dark)",
  dark: "var(--brand-yellow)",
};

export interface MantinePanelProps extends React.HTMLAttributes<HTMLElement> {
  tone?: MantinePanelTone;
  shadow?: boolean;
  as?: "section" | "form";
  className?: string;
}

export function MantinePanel({
  tone = "white",
  shadow = true,
  as = "section",
  className,
  style,
  children,
  ...props
}: MantinePanelProps) {
  const composedStyle: React.CSSProperties = {
    backgroundColor: TONE_BG[tone],
    color: TONE_FG[tone],
    border: "4px solid var(--brand-dark)",
    padding: "1.25rem",
    ...(shadow ? { boxShadow: "6px 6px 0 0 var(--brand-dark)" } : null),
    ...style,
  };
  return (
    <MantinePaperBase
      component={as}
      className={cn("unveiled-mantine-paper-root", className)}
      style={composedStyle}
      {...(props as React.ComponentProps<typeof MantinePaperBase>)}
    >
      {children}
    </MantinePaperBase>
  );
}
