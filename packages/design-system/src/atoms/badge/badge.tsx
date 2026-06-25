import { Badge as HeroUIBadge } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../../lib/utils";

export type BadgeTone =
  | "dark"
  | "yellow"
  | "white"
  | "grey"
  | "success"
  | "error";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  content?: React.ReactNode;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  dark: "bg-brand-dark text-white",
  yellow: "bg-brand-yellow text-brand-dark",
  white: "bg-white text-brand-dark",
  grey: "bg-brand-grey text-brand-dark",
  success: "bg-[var(--unveiled-status-success)] text-brand-dark",
  error: "bg-[var(--unveiled-status-error)] text-brand-dark",
};

export function Badge({
  className,
  tone = "dark",
  content,
  children,
  ...props
}: BadgeProps) {
  return (
    <HeroUIBadge
      content={content}
      classNames={{
        base: cn(
          "inline-flex items-center gap-1 border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]",
          TONE_CLASSES[tone],
          className,
        ),
      }}
      {...(props as unknown as React.ComponentProps<typeof HeroUIBadge>)}
    >
      {children}
    </HeroUIBadge>
  );
}
