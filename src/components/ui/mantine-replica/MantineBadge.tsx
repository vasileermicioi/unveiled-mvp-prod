// @ladle-only
import { Badge as MantineBadgeBase } from "@mantine/core";
import type * as React from "react";

import { cn } from "@/components/ui/mantine-replica/cn";

export type MantineBadgeTone =
  | "dark"
  | "yellow"
  | "white"
  | "grey"
  | "success"
  | "error";

const TONE_BG: Record<MantineBadgeTone, string> = {
  dark: "var(--brand-dark)",
  yellow: "var(--brand-yellow)",
  white: "var(--brand-white)",
  grey: "var(--brand-grey)",
  success: "var(--brand-success)",
  error: "var(--brand-error)",
};

const TONE_FG: Record<MantineBadgeTone, string> = {
  dark: "var(--brand-white)",
  yellow: "var(--brand-dark)",
  white: "var(--brand-dark)",
  grey: "var(--brand-dark)",
  success: "var(--brand-dark)",
  error: "var(--brand-dark)",
};

export interface MantineBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: MantineBadgeTone;
  className?: string;
}

export function MantineBadge({
  tone = "dark",
  className,
  style,
  children,
  ...props
}: MantineBadgeProps) {
  const composedStyle: React.CSSProperties = {
    backgroundColor: TONE_BG[tone],
    color: TONE_FG[tone],
    borderColor: "var(--brand-dark)",
    borderWidth: 2,
    borderStyle: "solid",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontWeight: 900,
    fontSize: "9px",
    padding: "4px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    ...style,
  };
  return (
    <MantineBadgeBase
      className={cn("unveiled-mantine-badge-root", className)}
      style={composedStyle}
      {...(props as React.ComponentProps<typeof MantineBadgeBase>)}
    >
      {children}
    </MantineBadgeBase>
  );
}
