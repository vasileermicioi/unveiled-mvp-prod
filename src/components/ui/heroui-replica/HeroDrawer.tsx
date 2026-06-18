// @ladle-only
import {
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Drawer as HeroUIDrawer,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type HeroDrawerProps = React.ComponentProps<typeof HeroUIDrawer>;

export function HeroDrawer({ className, children, ...props }: HeroDrawerProps) {
  return (
    <HeroUIDrawer
      classNames={{
        base: cn(
          "border-l-4 border-brand-dark bg-white shadow-[12px_0_0_0_var(--brand-dark)]",
          className,
        ),
      }}
      {...props}
    >
      {children}
    </HeroUIDrawer>
  );
}

export {
  DrawerBody as HeroDrawerBody,
  DrawerContent as HeroDrawerContent,
  DrawerFooter as HeroDrawerFooter,
  DrawerHeader as HeroDrawerHeader,
};
