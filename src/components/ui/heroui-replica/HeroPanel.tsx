// @ladle-only
import type * as React from "react";

import { cn } from "@/lib/utils";

export type HeroPanelProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "form";
  tone?: "white" | "yellow" | "cream" | "dark" | "grey";
  shadow?: boolean;
};

const toneClass = {
  white: "bg-white text-brand-dark",
  yellow: "bg-brand-yellow text-brand-dark",
  cream: "bg-brand-cream text-brand-dark",
  grey: "bg-brand-grey text-brand-dark",
  dark: "bg-brand-dark text-brand-yellow",
} as const;

export function HeroPanel({
  as,
  className,
  tone = "white",
  shadow = true,
  children,
  ...props
}: HeroPanelProps) {
  const Component = as ?? "section";
  return (
    <Component
      className={cn(
        "border-4 border-brand-dark p-5 md:p-8",
        toneClass[tone],
        shadow && "unveiled-shadow",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
