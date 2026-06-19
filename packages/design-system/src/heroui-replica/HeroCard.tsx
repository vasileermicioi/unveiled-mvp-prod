// @ladle-only
import { Card as HeroUICard } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroCardProps = React.ComponentProps<typeof HeroUICard>;

export function HeroCard({ className, children, ...props }: HeroCardProps) {
  return (
    <HeroUICard
      className={cn(
        "rounded-none border-4 border-brand-dark bg-white text-brand-dark shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </HeroUICard>
  );
}
