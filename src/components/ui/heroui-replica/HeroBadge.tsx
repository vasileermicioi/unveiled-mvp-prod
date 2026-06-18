// @ladle-only
import { Badge as HeroUIBadge } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type HeroBadgeProps = React.ComponentProps<typeof HeroUIBadge> & {
  tone?: "dark" | "yellow" | "white" | "grey" | "success" | "error";
};

const toneClass = {
  dark: "bg-brand-dark text-white",
  yellow: "bg-brand-yellow text-brand-dark",
  white: "bg-white text-brand-dark",
  grey: "bg-brand-grey text-brand-dark",
  success: "bg-brand-success text-brand-dark",
  error: "bg-brand-error text-brand-dark",
} as const;

export function HeroBadge({
  className,
  tone = "dark",
  children,
  ...props
}: HeroBadgeProps) {
  return (
    <HeroUIBadge
      className={cn(
        "rounded-none border-2 border-brand-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </HeroUIBadge>
  );
}
