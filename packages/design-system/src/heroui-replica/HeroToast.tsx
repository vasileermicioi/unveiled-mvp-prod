// @ladle-only
import { Alert } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroToastProps = React.ComponentProps<typeof Alert>;

export function HeroToast({ className, ...props }: HeroToastProps) {
  return (
    <Alert
      classNames={{
        base: cn(
          "rounded-none border-4 border-brand-dark bg-white unveiled-shadow",
          className,
        ),
        title: "font-display uppercase",
        description: "text-xs font-bold uppercase tracking-widest opacity-60",
      }}
      {...props}
    />
  );
}
