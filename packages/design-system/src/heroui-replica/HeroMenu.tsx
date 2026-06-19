// @ladle-only
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import type * as React from "react";

import { cn } from "../lib/utils";

export type HeroMenuProps = React.ComponentProps<typeof Popover>;

export function HeroMenu({ className, children, ...props }: HeroMenuProps) {
  return (
    <Popover
      classNames={{
        content: cn(
          "rounded-none border-4 border-brand-dark bg-white p-2 unveiled-shadow",
          className,
        ),
      }}
      {...props}
    >
      {children}
    </Popover>
  );
}

export { PopoverContent as HeroMenuContent, PopoverTrigger as HeroMenuTrigger };
